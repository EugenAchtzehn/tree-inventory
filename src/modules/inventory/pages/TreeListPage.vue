<script setup lang="ts">
import { onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import AppHeader from '@/shared/AppHeader.vue'
import { useInventoryStore } from '../store'

const inventory = useInventoryStore()
const treeMarkUrl = `${import.meta.env.BASE_URL}tree-mark.svg`
onMounted(() => inventory.load())
const date = (value: string) => new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
</script>

<template>
  <main class="page-shell">
    <div class="content-page">
      <AppHeader title="已盤點樹木"><Tag :value="`${inventory.trees.length} 棵`" severity="success" /></AppHeader>
      <div v-if="inventory.loading" class="grid min-h-64 place-items-center"><ProgressSpinner /></div>
      <Message v-else-if="inventory.error" severity="error">{{ inventory.error }}</Message>
      <Card v-else-if="!inventory.trees.length" class="text-center">
        <template #content>
          <img :src="treeMarkUrl" alt="" class="mx-auto mb-5 size-20 rounded-3xl opacity-80" />
          <h2 class="text-xl font-bold">尚未有盤點紀錄</h2>
          <p class="text-slate-500">回到地圖，點擊左上角的小樹開始第一筆盤點。</p>
          <Button as="router-link" to="/map" label="前往盤點地圖" icon="pi pi-map" />
        </template>
      </Card>
      <div v-else class="grid gap-3">
        <Card v-for="tree in inventory.trees" :key="tree.id">
          <template #content>
            <div class="flex gap-4">
              <div class="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e4edc8] text-2xl">🌳</div>
              <div class="min-w-0 flex-1">
                <h2 class="m-0 text-lg font-extrabold">{{ tree.species.name }}</h2>
                <p class="my-1 text-sm text-slate-500">{{ date(tree.observedAt) }}</p>
                <p class="mb-0 mt-3 text-sm">胸圍 {{ tree.circumferenceCm }} cm · 樹高 {{ tree.heightM }} m</p>
              </div>
              <Button as="router-link" :to="`/trees/${tree.id}`" icon="pi pi-chevron-right" aria-label="查看詳細資料" rounded text />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </main>
</template>
