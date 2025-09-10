import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useState, useEffect } from "react"

import { categories } from "../categories"
import type { BasePlacesData, CdnPlace, Place } from "../map-types"
import {
  MILLISECONDS_IN_MINUTE,
  BTCMAP_V4_API_BASE,
  BTCMAP_V4_PLACES_CDN,
} from "@app/config"

const LIMIT = 5000

export const usePlacesData = () => {
  const [error, setError] = useState<string | null>(null)
  const [places, setPlaces] = useState<BasePlacesData | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchAndUpdate = async () => {
      const start = performance.now()
      try {
        setLoading(true)

        const cachedData = await AsyncStorage.getItem("btcmap_places_v4")
        let currentData: BasePlacesData

        if (cachedData) {
          currentData = JSON.parse(cachedData)
          console.log(`Restored: ${currentData.baseData.length} places`)
        } else {
          const { data, needsNameEnrichment } = await initializeBasePlaces()
          currentData = data

          if (needsNameEnrichment) {
            await enrichPlacesWithNames(currentData)
          }

          normalize(currentData)
          await AsyncStorage.setItem("btcmap_places_v4", JSON.stringify(currentData))
          console.log(`Initialized: ${currentData.baseData.length} places`)
        }

        setPlaces(currentData)

        const timeSinceLastUpdate =
          Date.now() - new Date(currentData.lastUpdated).getTime()
        if (timeSinceLastUpdate <= 5 * MILLISECONDS_IN_MINUTE) {
          return
        }

        console.log("Fetching updates...")

        const newPlaces = (await fetchPlacesFromApi(
          currentData.lastUpdated,
          true,
        )) as Place[]

        if (!newPlaces.length) {
          console.log("No new places found")
          return
        }

        console.log(`New places fetched: ${newPlaces.length}`)

        const newPlacesIds = newPlaces.map((place) => place.id)
        const oldFiltered = currentData.baseData.filter(
          (p) => !newPlacesIds.includes(p.id),
        )

        const updatedData: BasePlacesData = {
          lastUpdated: new Date().toISOString(),
          baseData: [...oldFiltered, ...newPlaces],
        }

        normalize(updatedData)
        await AsyncStorage.setItem("btcmap_places_v4", JSON.stringify(updatedData))
        setPlaces(updatedData)
      } catch (error) {
        console.error(error)
        setError("Could not sync BTC Map data, please try again or contact BTC Map.")
      } finally {
        console.log(`Operation took ${performance.now() - start} ms`)
        setLoading(false)
      }
    }

    fetchAndUpdate()
  }, [])

  return { places, error, isLoading }
}

const fetchPlacesFromApi = async (
  updatedSince: string = "1970-01-01T00:00:00Z",
  includeAllFields: boolean = false,
): Promise<Place[] | Omit<Place, "lat" | "lon" | "icon">[]> => {
  const allPlaces = includeAllFields
    ? ([] as Place[])
    : ([] as Omit<Place, "lat" | "lon" | "icon">[])

  let currentUpdatedSince = updatedSince

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const fields = includeAllFields
      ? "id,lat,lon,name,updated_at,icon"
      : "id,name,updated_at,icon"

    const { data } = await axios.get<Place[] | Omit<Place, "lat" | "lon" | "icon">[]>(
      `${BTCMAP_V4_API_BASE}/places?updated_since=${currentUpdatedSince}&limit=${LIMIT}&fields=${fields}`,
    )

    if (!data.length) break

    allPlaces.push(...data)

    const lastItem = data[data.length - 1]
    if (!lastItem || !lastItem.updated_at || data.length < LIMIT) {
      break
    }

    currentUpdatedSince = lastItem.updated_at
  }

  return allPlaces
}

const initializeBasePlaces = async (): Promise<{
  data: BasePlacesData
  needsNameEnrichment: boolean
}> => {
  try {
    const cdnData = await axios.get<CdnPlace[]>(BTCMAP_V4_PLACES_CDN)
    const headers = cdnData.headers
    const lastUpdatedRaw =
      headers["last-modified"] || headers["Last-Modified"] || headers["Last Modified"]
    const lastUpdated = new Date(lastUpdatedRaw).toISOString()

    console.log(`CDN: initialized ${cdnData.data.length} places`)
    return {
      data: { baseData: cdnData.data, lastUpdated },
      needsNameEnrichment: true,
    }
  } catch (error) {
    console.warn("CDN failed, falling back to API with full data:", error)

    const places = (await fetchPlacesFromApi("1970-01-01T00:00:00Z", true)) as Place[]
    console.log(`API fallback: initialized ${places.length} places with names`)

    return {
      data: {
        baseData: places,
        lastUpdated: new Date().toISOString(),
      },
      needsNameEnrichment: false,
    }
  }
}

const enrichPlacesWithNames = async (places: BasePlacesData): Promise<void> => {
  const namesData = (await fetchPlacesFromApi("1970-01-01T00:00:00Z", false)) as Omit<
    Place,
    "lat" | "lon" | "icon"
  >[]

  for (const nameData of namesData) {
    const place = places.baseData.find((p) => p.id === nameData.id)
    if (place) {
      place.name = nameData.name
    }
  }

  console.log("Names enriched")
}

const normalize = (apiData: BasePlacesData): void => {
  apiData.baseData.forEach((place) => {
    place.icon = place.icon.replace(/_/g, "-")
    place.category = categories[place.icon]
  })
}
