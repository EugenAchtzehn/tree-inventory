<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Drawer from 'primevue/drawer'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import TreeFormDrawer from '@/modules/inventory/components/TreeFormDrawer.vue'
import { useInventoryStore } from '@/modules/inventory/store'
import type { CreateTreeInput, GeoPoint } from '@/modules/inventory/types'
import { useLocationStore } from '@/modules/location/store'
import { destinationPoint } from '@/modules/location/geo'
import { useAuthStore } from '@/modules/auth/store'
import MapCanvas from './MapCanvas.vue'
import { BASEMAPS, type BasemapId } from './basemaps'

interface MapCanvasExposed {
  startDraft(point: GeoPoint): void
  cancelDraft(): void
  completeDraft(): void
  getCenter(): GeoPoint
  focusTree(id: string): void
}

const router = useRouter()
const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const inventory = useInventoryStore()
const location = useLocationStore()
const mapRef = ref<MapCanvasExposed | null>(null)
const menuVisible = ref(false)
const formVisible = ref(false)
const treeMarkUrl = `${import.meta.env.BASE_URL}tree-mark.svg`
const draftPoint = ref<GeoPoint | null>(null)
const saving = ref(false)
const basemap = ref<BasemapId>('photo')
const mapReady = ref(false)
const permissionsPrompt = computed(() => !location.position && location.permissions?.geolocation !== 'denied')
const locationLabel = computed(() => {
  if (location.position?.heading != null) return `定位 ±${Math.round(location.position.accuracy)}m · 朝向可用`
  if (location.position) return `定位 ±${Math.round(location.position.accuracy)}m · 朝向不可用`
  return '尚未取得定位'
})

onMounted(async () => {
  await Promise.all([inventory.load(), location.inspect()])
  await nextTick()
  focusRequestedTree()
})
onBeforeUnmount(() => location.stop())

function startTreePlacement() {
  const current = location.position
  let point = mapRef.value?.getCenter() ?? { latitude: 23.7, longitude: 121 }
  if (current) {
    point = current.heading == null
      ? { latitude: current.latitude, longitude: current.longitude }
      : destinationPoint({ latitude: current.latitude, longitude: current.longitude }, current.heading, 3)
  }
  draftPoint.value = point
  mapRef.value?.startDraft(point)
  toast.add({ severity: 'info', summary: '請放置小樹', detail: current?.heading == null ? '目前無朝向資料，請拖曳到正確位置' : '已放在朝向前方 3 公尺，可拖曳微調', life: 4000 })
}

function editDraft(point: GeoPoint) {
  draftPoint.value = point
  formVisible.value = true
}

function cancelDraft() {
  if (!formVisible.value) {
    draftPoint.value = null
    mapRef.value?.cancelDraft()
  }
}

async function saveTree(input: CreateTreeInput) {
  saving.value = true
  try {
    const tree = await inventory.create(input)
    formVisible.value = false
    draftPoint.value = null
    mapRef.value?.completeDraft()
    toast.add({ severity: 'success', summary: '盤點完成', detail: `${tree.species.name} 已加入地圖`, life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: '儲存失敗', detail: error instanceof Error ? error.message : '請稍後再試', life: 4500 })
  } finally {
    saving.value = false
  }
}

async function logout() {
  await auth.logout()
  await router.replace('/login')
}

function focusRequestedTree() {
  if (mapReady.value && typeof route.query.focus === 'string') mapRef.value?.focusTree(route.query.focus)
}

function handleMapReady() {
  mapReady.value = true
  focusRequestedTree()
}
</script>

<template>
  <main class="map-page relative h-dvh w-full overflow-hidden bg-[#ebebeb]">
    <MapCanvas ref="mapRef" :basemap="basemap" :trees="inventory.trees" :position="location.position" @ready="handleMapReady" @draft-confirm="editDraft" @draft-cancel="draftPoint = null" @tree-select="router.push(`/trees/${$event}`)" />

    <div class="absolute left-3 top-0 z-10 flex items-stretch border border-[#bfbfbf] bg-white shadow-md safe-top">
      <Button icon="pi pi-bars" aria-label="開啟功能選單" severity="secondary" text class="!size-11 !rounded-none !border-r !border-[#dedede]" @click="menuVisible = true" />
      <div class="hidden items-center gap-2 px-3 sm:flex">
        <img :src="treeMarkUrl" alt="" class="size-7" />
        <div><p class="m-0 text-sm font-semibold leading-4">森野盤點</p><p class="m-0 text-[10px] tracking-wider text-[#6b6b6b] uppercase">Field Map</p></div>
      </div>
      <button type="button" aria-label="新增樹木盤點" class="flex min-h-11 items-center gap-2 border-0 bg-[#007ac2] px-3 font-semibold text-white transition hover:bg-[#00619b] active:bg-[#004874]" @click="startTreePlacement">
        <i class="pi pi-plus" /><span class="hidden text-sm sm:inline">新增盤點</span>
      </button>
    </div>

    <div class="absolute right-3 top-0 z-10 flex border border-[#bfbfbf] bg-white shadow-md safe-top" aria-label="底圖選擇">
      <button v-for="item in BASEMAPS" :key="item.id" type="button" class="min-h-11 border-0 border-r border-[#dedede] px-3 text-sm font-semibold transition last:border-r-0" :class="basemap === item.id ? 'bg-[#e5f4fb] text-[#004874] shadow-[inset_0_-3px_0_#007ac2]' : 'bg-white text-[#4a4a4a] hover:bg-[#f2f2f2]'" @click="basemap = item.id">{{ item.label }}</button>
    </div>

    <div class="absolute bottom-5 left-1/2 z-10 w-[min(92%,26rem)] -translate-x-1/2 safe-bottom">
      <Card v-if="permissionsPrompt" class="!shadow-lg">
        <template #content>
          <div class="flex items-start gap-3">
            <div class="grid size-10 shrink-0 place-items-center bg-[#e5f4fb] text-[#00619b]"><i class="pi pi-compass text-lg" /></div>
            <div class="min-w-0 flex-1"><p class="calcite-eyebrow">Location</p><h2 class="m-0 text-base font-semibold">啟用定位與朝向</h2><p class="mb-3 mt-1 text-sm leading-5 text-[#6b6b6b]">用於顯示目前位置，並將新樹放在面向前方。</p><Button label="允許使用" icon="pi pi-map-marker" size="small" :loading="location.requesting" @click="location.enable" /></div>
          </div>
        </template>
      </Card>
      <Message v-else-if="location.error" severity="warn" :closable="false">{{ location.error }}</Message>
      <div v-else class="mx-auto flex w-fit items-center gap-2 border border-[#bfbfbf] bg-white/95 px-3 py-2 text-xs font-semibold text-[#4a4a4a] shadow-md backdrop-blur"><span class="size-2 rounded-full bg-[#288835]" />{{ locationLabel }}</div>
    </div>

    <div v-if="inventory.loading" class="absolute inset-0 z-20 grid place-items-center bg-white/45 backdrop-blur-sm"><ProgressSpinner /></div>

    <Drawer v-model:visible="menuVisible" header="森野盤點" class="!w-[min(86vw,22rem)]">
      <p class="calcite-eyebrow">Field Operations</p>
      <div class="mb-5 flex items-center gap-3 border-y border-[#dedede] bg-[#f7f7f7] p-4">
        <div class="grid size-10 place-items-center rounded-full bg-[#d6effc] text-base font-semibold text-[#004874]">{{ auth.user?.name.slice(0, 1) }}</div>
        <div><p class="m-0 font-semibold">{{ auth.user?.name }}</p><p class="m-0 text-sm text-[#6b6b6b]">{{ auth.user?.email }}</p></div>
      </div>
      <nav class="grid gap-2" aria-label="主要功能">
        <Button as="router-link" to="/account" label="帳戶管理" icon="pi pi-user" severity="secondary" text class="!justify-start !rounded-none" @click="menuVisible = false" />
        <Button as="router-link" to="/trees" label="已盤點樹木" icon="pi pi-list" severity="secondary" text class="!justify-start !rounded-none" @click="menuVisible = false" />
        <Button label="登出" icon="pi pi-sign-out" severity="danger" text class="!mt-4 !justify-start" @click="logout" />
      </nav>
    </Drawer>

    <TreeFormDrawer v-model:visible="formVisible" :point="draftPoint" :species="inventory.species" :saving="saving" @save="saveTree" @cancel="cancelDraft" />
  </main>
</template>

<style scoped>
.map-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
}
</style>
