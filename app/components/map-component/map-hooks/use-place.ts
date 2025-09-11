import { useEffect, useState } from "react"
import axios from "axios"

import { BTCMAP_V4_API_BASE } from "@app/config"

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
        setError("Could not fetch place data, please try again")
      } finally {
        setLoading(false)
      }
    }

    fetchPlace()
  }, [id])

  return { placeData, error, isLoading }
}
