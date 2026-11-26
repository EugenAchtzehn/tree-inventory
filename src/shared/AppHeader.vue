<script setup lang="ts">
import Button from 'primevue/button'
defineProps<{ title: string; backTo?: string }>()
</script>

<template>
  <header class="page-header">
    <Button as="router-link" :to="backTo ?? '/map'" icon="pi pi-arrow-left" aria-label="返回地圖" text severity="secondary" />
    <div>
      <p class="calcite-eyebrow">Tree Inventory</p>
      <h1 class="page-title">{{ title }}</h1>
    </div>
    <div class="ml-auto"><slot /></div>
  </header>
</template>
