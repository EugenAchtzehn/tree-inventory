import type { StyleSpecification } from 'maplibre-gl'

export type BasemapId = 'photo' | 'emap' | 'osm'

export interface BasemapOption {
  id: BasemapId
  label: string
}

export const BASEMAPS: BasemapOption[] = [
  { id: 'photo', label: '航照' },
  { id: 'emap', label: '電子地圖' },
  { id: 'osm', label: 'OSM' },
]

const definitions: Record<BasemapId, { tiles: string[]; attribution: string }> = {
  photo: {
    tiles: ['https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}'],
    attribution: '© 國土測繪中心',
  },
  emap: {
    tiles: ['https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}'],
    attribution: '© 國土測繪中心',
  },
  osm: {
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors',
  },
}

export function createBasemapStyle(id: BasemapId): StyleSpecification {
  const source = definitions[id]
  return {
    version: 8,
    sources: {
      basemap: { type: 'raster', tiles: source.tiles, tileSize: 256, minzoom: 0, maxzoom: 19, attribution: source.attribution },
    },
    layers: [{ id: 'basemap', type: 'raster', source: 'basemap' }],
  }
}
