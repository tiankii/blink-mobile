import { useEffect, useState } from "react"
import { BTCMAP_V4_API_BASE } from "@app/config"
import axios from "axios"

/**
 * Hook using V4 place endpoint to dynamic fetch place data.
 * Mostly used for not critical data that aren't stored on device
 * todo: add payment and offer tags here
 * @param id - BTCMap place id
 */
export const usePlace = (id?: number | null) => {
  const [error, setError] = useState<string | null>(null)
  const [placeData, setPlaceData] = useState<{
    id: string
    name: string
    phone: string
    website: string
    address: string
  } | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // reset state when id changes
    setError(null)
    setPlaceData(null)

    if (!id) {
      setLoading(false)
      return
    }

    const fetchPlace = async () => {
      setLoading(true)

      try {
        const { data } = await axios.get<{
          id: string
          name: string
          phone: string
          website: string
          address: string
        }>(`${BTCMAP_V4_API_BASE}/places/${id}?fields=id,name,phone,website,address`)
        setPlaceData(data)
      } catch (error) {
        console.error(error)
        setError("Could not fetch place data, please try again")
      } finally {
        setLoading(false)
      }
    }

    fetchPlace()
  }, [id])

  return { placeData, error, isLoading }
}
