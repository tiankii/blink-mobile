import { Geometry } from "geojson"
import { Category } from "../categories.ts"
type CdnPlace = {
  id: string
  lat: number
  lon: number
  icon: string
}

type Place = CdnPlace & {
  updated_at?: string | null
  name?: string | null
  category?: Category | null
  tags?: {
    [key: string]: string
  }
}

type BasePlacesData = {
  baseData: Place[]
  lastUpdated: string
}

type AreaDataRpc = {
  jsonrpc: "2.0"
  result: {
    id: number
    name: string
    polygon: {
      lat: number
      lon: number
    }[]
    type: string
    created_at: string
  }
  id: number
}

export type AreaData = {
  id: number
  updated_at: string
  tags: Record<string, unknown> & {
    name?: string
    geo_json?: Geometry
  }
}

export type { CdnPlace, Place, BasePlacesData, AreaDataRpc }
