import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useState, useEffect } from "react"
import { categories } from "../categories"
import type { BasePlacesData, CdnPlace, Place } from "../map-types"
import { MILISECONDS_IN_MINUTE, V4_API_BASE, V4_PLACES_CDN } from "../map-constants"

const LIMIT = 5000

/**
 * Function containing whole place fetching logic. Reads data from asyncStorege cache,
 * tries to sync them with btcmap API. Contains "cold start" logic, which fetches places from CDN.
 * Maps icons to react-native-material-icons and writes categories based on icon set.
 */
export const usePlacesData = () => {
  const [error, setError] = useState<string | null>(null)
  const [places, setPlaces] = useState<BasePlacesData | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchAndUpdate = async () => {
      const start = performance.now()
      try {
        setLoading(true)

        // check if we have cached data
        const cachedData = await AsyncStorage.getItem("btcmap_places_v4")
        let currentData: BasePlacesData

        if (cachedData) {
          currentData = JSON.parse(cachedData)
          console.log(`Restored: ${currentData.baseData.length} places`)
        } else {
          // initialize from scratch
          const { data, needsNameEnrichment } = await initializeBasePlaces()
          currentData = data

          // only enrich with names if we got data from CDN (which doesn't include names)
          if (needsNameEnrichment) {
            await enrichPlacesWithNames(currentData)
          }

          normalize(currentData)
          await AsyncStorage.setItem("btcmap_places_v4", JSON.stringify(currentData))
          console.log(`Initialized: ${currentData.baseData.length} places`)
        }

        setPlaces(currentData)

        // check if we need to update (don't refetch too often)
        const timeSinceLastUpdate =
          Date.now() - new Date(currentData.lastUpdated).getTime()
        if (timeSinceLastUpdate <= 5 * MILISECONDS_IN_MINUTE) {
          return
        }

        console.log("Fetching updates...")

        // fetch updates
        const newPlaces = (await fetchPlacesFromApi(
          currentData.lastUpdated,
          true,
        )) as Place[]

        if (!newPlaces.length) {
          console.log("No new places found")
          return
        }

        console.log(`New places fetched: ${newPlaces.length}`)

        // update data
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

// ----- Helpers for hooks ------

/**
 * Function fetching places from API. May be used to enrich cdn places in data, or to fetch new data.
 * @param updatedSince - pagination by data, we're fetching data since this iso string date
 * @param includeAllFields - if true, returns Place[], else Omit<Place, "lat" | "lon" | "icon">[]
 */
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
      `${V4_API_BASE}/places?updated_since=${currentUpdatedSince}&limit=${LIMIT}&fields=${fields}`,
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
  // try CDN first
  try {
    const cdnData = await axios.get<CdnPlace[]>(V4_PLACES_CDN)
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

    // fallback to API - fetch everything with ALL fields (including names)
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
