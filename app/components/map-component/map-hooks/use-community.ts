import { useEffect, useState } from "react"
import type { GetAreaResponse, AreaDataRpc, Area } from "../map-types"
import axios, { AxiosHeaders } from "axios"
import { RPC_URL } from "../map-constants"

/**
 * ---
 * Since there's no v4 endpoint for areas, we need to use v3, which will get deprecated soon.
 * ---
 * Hook to fetch area (communities also) data by id
 * @param id Community ID. Usually pased from search modal.
 */
export const useArea = (id: number | null) => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [community, setCommunity] = useState<Area | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        if (!id) {
          setCommunity(null)
          return
        }
        const start = performance.now()
        const { data } = await axios.get<GetAreaResponse>(
          `https://api.btcmap.org/v3/areas/${id}`,
        )

        if (!cancelled) {
          setCommunity(data)
        }
        console.log(`Downloading area data took ${performance.now() - start} ms`)
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setError("Could not fetch community data, please try again later")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    fetchData()

    return () => {
      cancelled = true
    }
  }, [id])

  return { community, isLoading, error }
}

/**
 * Hook for fetching area data (community) by rpc. In 99% cases it's better to use REST version.
 *
 * @param id Community id
 */
export const useCommunityRpc = (id: string | null) => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [community, setCommunity] = useState<AreaDataRpc | null>(null)

  useEffect(() => {
    try {
      if (!id) {
        setCommunity(null)
        return
      }
      const request = JSON.stringify({
        jsonrpc: "2.0",
        method: "get_area",
        params: {
          // eslint-disable-next-line camelcase
          area_id: JSON.parse(id),
        },
        id: 1,
      })

      const headers = new AxiosHeaders()
      headers.set("Content-Type", "application/json")

      setLoading(true)
      ;(async () => {
        const { data } = await axios.post<AreaDataRpc>(RPC_URL, request, {
          headers,
        })
        setCommunity(data)
      })()
    } catch (e) {
      console.error(e)
      setError("Could not fetch community data, please try again later")
    } finally {
      setLoading(false)
    }
  }, [id])

  return { community, isLoading, error }
}
