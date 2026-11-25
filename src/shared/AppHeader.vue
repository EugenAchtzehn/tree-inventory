<script setup lang="ts">
import Button from 'primevue/button'
defineProps<{ title: string; backTo?: string }>()
</script>

<template>
  <header class="page-header">
    <Button as="router-link" :to="backTo ?? '/map'" icon="pi pi-arrow-left" aria-label="返回地圖" rounded text severity="secondary" />
    <h1 class="page-title">{{ title }}</h1>
    <div class="ml-auto"><slot /></div>
  </header>
</template>
