<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import AppHeader from '@/shared/AppHeader.vue'
import { dependencies } from '@/app/dependencies'
import type { TreeRecord } from '../types'

const route = useRoute()
const tree = ref<TreeRecord | null>(null)
const loading = ref(true)
const mapLink = computed(() => tree.value ? { name: 'map', query: { focus: tree.value.id } } : '/map')
onMounted(async () => {
  tree.value = await dependencies.inventory.getTree(String(route.params.id))
  loading.value = false
})
const date = (value: string) => new Intl.DateTimeFormat('zh-TW', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
</script>

<template>
  <main class="page-shell">
    <div class="content-page">
      <AppHeader title="樹木詳細資料" back-to="/trees" />
      <div v-if="loading" class="grid min-h-64 place-items-center"><ProgressSpinner /></div>
      <Message v-else-if="!tree" severity="warn">找不到這筆盤點資料。</Message>
      <Card v-else>
        <template #title><div class="border-b border-[#dedede] pb-4"><p class="calcite-eyebrow">Observation detail</p><span class="text-2xl font-semibold">🌳 {{ tree.species.name }}</span></div></template>
        <template #content>
          <dl class="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-5">
            <dt class="font-semibold text-[#6b6b6b]">胸圍</dt><dd class="m-0">{{ tree.circumferenceCm }} cm</dd>
            <dt class="font-semibold text-[#6b6b6b]">樹高</dt><dd class="m-0">{{ tree.heightM }} m</dd>
            <dt class="font-semibold text-[#6b6b6b]">盤點時間</dt><dd class="m-0">{{ date(tree.observedAt) }}</dd>
            <dt class="font-semibold text-[#6b6b6b]">座標</dt><dd class="m-0 font-mono text-sm">{{ tree.latitude.toFixed(6) }}, {{ tree.longitude.toFixed(6) }}</dd>
            <dt class="font-semibold text-[#6b6b6b]">備註</dt><dd class="m-0 whitespace-pre-wrap">{{ tree.notes || '—' }}</dd>
          </dl>
          <Button as="router-link" :to="mapLink" label="在地圖定位" icon="pi pi-map-marker" class="mt-8" fluid />
        </template>
      </Card>
    </div>
  </main>
</template>
