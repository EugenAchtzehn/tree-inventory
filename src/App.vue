<script setup lang="ts">
import Toast from 'primevue/toast'
import ReloadPrompt from '@/shared/ReloadPrompt.vue'
</script>

<template>
  <RouterView />
  <Toast position="top-center" />
  <ReloadPrompt />
</template>
