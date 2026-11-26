<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>()
const treeMarkUrl = `${import.meta.env.BASE_URL}tree-mark.svg`
</script>

<template>
  <main class="min-h-dvh bg-[#f7f7f7] px-4 py-8 safe-top safe-bottom sm:grid sm:place-items-center">
    <section class="mx-auto grid w-full max-w-4xl overflow-hidden border border-[#d4d4d4] bg-white shadow-sm md:grid-cols-[minmax(17rem,0.8fr)_1.2fr]">
      <header class="relative overflow-hidden bg-[#142b3a] px-7 py-9 text-white md:min-h-[36rem] md:px-9">
        <div class="absolute inset-x-0 top-0 h-1 bg-[#00a9e0]" />
        <div class="mb-14 flex items-center gap-3">
          <img :src="treeMarkUrl" alt="" class="size-11 border border-white/30 bg-white" />
          <div><p class="m-0 text-lg font-semibold">森野盤點</p><p class="m-0 text-xs tracking-[.14em] text-[#b9dff2] uppercase">Tree Inventory</p></div>
        </div>
        <p class="mb-2 text-xs font-bold tracking-[.12em] text-[#5cc9f5] uppercase">Field Operations</p>
        <h1 class="m-0 text-3xl font-semibold tracking-tight">{{ title }}</h1>
        <p class="mb-0 mt-3 max-w-xs leading-7 text-[#d8e7ef]">{{ subtitle }}</p>
        <div class="mt-12 hidden border-t border-white/20 pt-5 text-sm text-[#b8cbd5] md:block">
          <p class="m-0"><i class="pi pi-map-marker mr-2 text-[#5cc9f5]" />地圖導向的樹木資源盤點</p>
          <p class="mb-0 mt-3"><i class="pi pi-wifi mr-2 text-[#5cc9f5]" />支援離線安裝與現地作業</p>
        </div>
      </header>
      <div class="self-center px-7 py-8 md:px-12"><slot /></div>
    </section>
  </main>
</template>
