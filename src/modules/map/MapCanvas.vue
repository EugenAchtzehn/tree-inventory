<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Map, Marker, NavigationControl, Popup, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import type { TreeRecord } from '@/modules/inventory/types'
import type { DevicePosition } from '@/modules/location/types'
import { createBasemapStyle, type BasemapId } from './basemaps'

setWorkerUrl(maplibreWorkerUrl)
const treeMarkUrl = `${import.meta.env.BASE_URL}tree-mark.svg`

const props = defineProps<{
  basemap: BasemapId
  trees: TreeRecord[]
  position: DevicePosition | null
}>()
const emit = defineEmits<{
  draftConfirm: [coordinates: { latitude: number; longitude: number }]
  draftCancel: []
  treeSelect: [id: string]
  ready: []
}>()

const container = ref<HTMLDivElement | null>(null)
let map: Map | null = null
let userMarker: Marker | null = null
let userArrow: HTMLElement | null = null
let draftMarker: Marker | null = null
let initialCentered = false
let resizeObserver: ResizeObserver | null = null

function ensureOperationalLayers() {
  if (!map || !map.isStyleLoaded()) return
  if (!map.getSource('trees')) {
    map.addSource('trees', { type: 'geojson', data: treeCollection() })
    map.addLayer({
      id: 'tree-halo', type: 'circle', source: 'trees',
      paint: { 'circle-radius': 14, 'circle-color': '#ffffff', 'circle-stroke-color': '#004874', 'circle-stroke-width': 2 },
    })
    map.addLayer({
      id: 'trees', type: 'circle', source: 'trees',
      paint: { 'circle-radius': 8, 'circle-color': '#288835' },
    })
    map.on('click', 'trees', (event) => {
      const id = event.features?.[0]?.properties?.id as string | undefined
      if (id) emit('treeSelect', id)
    })
    map.on('mouseenter', 'trees', () => { if (map) map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'trees', () => { if (map) map.getCanvas().style.cursor = '' })
  }
  updateTrees()
}

function treeCollection() {
  return {
    type: 'FeatureCollection' as const,
    features: props.trees.map((tree) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [tree.longitude, tree.latitude] },
      properties: { id: tree.id, name: tree.species.name },
    })),
  }
}

function updateTrees() {
  const source = map?.getSource('trees') as GeoJSONSource | undefined
  source?.setData(treeCollection())
}

function updateUser() {
  if (!map || !props.position) return
  if (!userMarker) {
    const element = document.createElement('div')
    element.className = 'user-location-marker'
    element.innerHTML = '<div class="user-heading"><i class="pi pi-chevron-up" aria-hidden="true"></i></div><div class="user-dot"></div>'
    userArrow = element.querySelector('.user-heading')
    userMarker = new Marker({ element }).setLngLat([props.position.longitude, props.position.latitude]).addTo(map)
  } else {
    userMarker.setLngLat([props.position.longitude, props.position.latitude])
  }
  if (userArrow) userArrow.style.transform = `rotate(${props.position.heading ?? 0}deg)`
  if (!initialCentered) {
    map.flyTo({ center: [props.position.longitude, props.position.latitude], zoom: 18, duration: 900 })
    initialCentered = true
  }
}

function startDraft(coordinates: { latitude: number; longitude: number }) {
  if (!map) return
  cancelDraft(false)
  const element = document.createElement('button')
  element.type = 'button'
  element.className = 'draft-tree-marker'
  element.setAttribute('aria-label', '移動或確認新樹位置')
  const treeImage = document.createElement('img')
  treeImage.src = treeMarkUrl
  treeImage.alt = ''
  element.append(treeImage)
  const marker = new Marker({ element, draggable: true })
    .setLngLat([coordinates.longitude, coordinates.latitude])
    .addTo(map)
  const popupContent = document.createElement('div')
  popupContent.className = 'draft-popup'
  popupContent.innerHTML = '<strong>確認樹木位置</strong><p>可先拖曳小樹微調，再開始填寫資料。</p>'
  const actions = document.createElement('div')
  actions.className = 'draft-popup-actions'
  const cancel = document.createElement('button')
  cancel.textContent = '取消'
  cancel.className = 'draft-action-secondary'
  cancel.addEventListener('click', () => cancelDraft(true))
  const confirm = document.createElement('button')
  confirm.textContent = '開始編輯'
  confirm.className = 'draft-action-primary'
  confirm.addEventListener('click', () => {
    const point = marker.getLngLat()
    marker.getPopup()?.remove()
    emit('draftConfirm', { latitude: point.lat, longitude: point.lng })
  })
  actions.append(cancel, confirm)
  popupContent.append(actions)
  marker.setPopup(new Popup({ offset: 28, closeButton: true }).setDOMContent(popupContent))
  marker.togglePopup()
  draftMarker = marker
  map.flyTo({ center: [coordinates.longitude, coordinates.latitude], zoom: Math.max(map.getZoom(), 18), duration: 650 })
}

function cancelDraft(notify = true) {
  draftMarker?.remove()
  draftMarker = null
  if (notify) emit('draftCancel')
}

function completeDraft() {
  cancelDraft(false)
}

function getCenter() {
  const center = map?.getCenter()
  return center ? { latitude: center.lat, longitude: center.lng } : { latitude: 23.7, longitude: 121 }
}

function focusTree(id: string) {
  const tree = props.trees.find((item) => item.id === id)
  if (tree && map) map.flyTo({ center: [tree.longitude, tree.latitude], zoom: 19, duration: 900 })
}

defineExpose({ startDraft, cancelDraft, completeDraft, getCenter, focusTree })

onMounted(() => {
  if (!container.value) return
  map = new Map({
    container: container.value,
    style: createBasemapStyle(props.basemap),
    center: [121, 23.7],
    zoom: 7,
    maxZoom: 20,
    attributionControl: { compact: true },
  })
  resizeObserver = new ResizeObserver(() => map?.resize())
  resizeObserver.observe(container.value)
  requestAnimationFrame(() => map?.resize())
  map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
  map.on('load', () => { ensureOperationalLayers(); updateUser(); emit('ready') })
})

watch(() => props.trees, updateTrees, { deep: true })
watch(() => props.position, updateUser, { deep: true })
watch(() => props.basemap, (id) => {
  if (!map) return
  map.setStyle(createBasemapStyle(id))
  map.once('style.load', ensureOperationalLayers)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  userMarker?.remove()
  draftMarker?.remove()
  map?.remove()
})
</script>

<template><div ref="container" class="absolute inset-0" aria-label="樹木盤點地圖" /></template>

<style>
.maplibregl-map { width: 100%; height: 100%; min-height: 100%; }
.user-location-marker { position: relative; width: 54px; height: 54px; pointer-events: none; }
.user-heading { position: absolute; inset: 0; transform-origin: 50% 50%; transition: transform 80ms linear; }
.user-heading .pi { position: absolute; left: 50%; top: -13px; color: #1c78ff; font-size: 22px; filter: drop-shadow(0 0 2px white) drop-shadow(0 1px 2px #0005); transform: translateX(-50%); }
.user-dot { position: absolute; left: 17px; top: 17px; width: 20px; height: 20px; border: 4px solid white; border-radius: 50%; background: #1c78ff; box-shadow: 0 2px 10px #0005; }
.draft-tree-marker { width: 48px; height: 48px; padding: 0; border: 3px solid white; border-radius: 2px; background: white; box-shadow: 0 2px 8px #0006; cursor: grab; }
.draft-tree-marker:active { cursor: grabbing; }
.draft-tree-marker img { display: block; width: 100%; height: 100%; }
.draft-popup { min-width: 220px; color: #141414; }
.draft-popup strong { font-size: 1rem; }
.draft-popup p { margin: .45rem 0 1rem; color: #6b6b6b; line-height: 1.45; font-size: .875rem; }
.draft-popup-actions { display: flex; justify-content: flex-end; gap: .5rem; }
.draft-popup-actions button { min-height: 36px; border: 1px solid transparent; border-radius: 2px; padding: 0 .9rem; font-weight: 600; cursor: pointer; }
.draft-action-primary { color: white; background: #007ac2; }
.draft-action-primary:hover { background: #00619b; }
.draft-action-secondary { color: #4a4a4a; border-color: #d4d4d4 !important; background: #ffffff; }
</style>
