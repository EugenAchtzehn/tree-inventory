<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>()
const treeMarkUrl = `${import.meta.env.BASE_URL}tree-mark.svg`
</script>

<template>
  <main class="min-h-dvh bg-[#173f35] px-4 py-8 safe-top safe-bottom sm:grid sm:place-items-center">
    <section class="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-[#f8f7f0] shadow-2xl">
      <header class="bg-[#244f43] px-7 pb-10 pt-8 text-white">
        <div class="mb-8 flex items-center gap-3">
          <img :src="treeMarkUrl" alt="" class="size-12 rounded-2xl" />
          <div><p class="m-0 text-xl font-black">森野盤點</p><p class="m-0 text-sm text-[#dbe9bb]">Tree Inventory</p></div>
        </div>
        <h1 class="m-0 text-3xl font-black">{{ title }}</h1>
        <p class="mb-0 mt-2 text-[#d6e2dc]">{{ subtitle }}</p>
      </header>
      <div class="px-7 py-8"><slot /></div>
    </section>
  </main>
</template>
