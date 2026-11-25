<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
function close() {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div v-if="offlineReady || needRefresh" class="fixed inset-x-4 bottom-4 z-[1000] mx-auto max-w-md safe-bottom">
    <Message severity="info" :closable="false">
      <div class="flex flex-wrap items-center gap-3">
        <span class="flex-1">{{ needRefresh ? '有新版本可用，完成手邊工作後再更新。' : '應用程式已可從主畫面開啟。' }}</span>
        <Button v-if="needRefresh" label="更新" size="small" @click="updateServiceWorker()" />
        <Button label="稍後" severity="secondary" text size="small" @click="close" />
      </div>
    </Message>
  </div>
</template>
