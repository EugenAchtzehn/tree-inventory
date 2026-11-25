import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { dependencies } from '@/app/dependencies'
import { toAppError } from '@/shared/errors'
import type { DevicePosition, PermissionSnapshot } from './types'

export const useLocationStore = defineStore('location', () => {
  const position = ref<DevicePosition | null>(null)
  const permissions = ref<PermissionSnapshot | null>(null)
  const error = ref<string | null>(null)
  const requesting = ref(false)
  const hasHeading = computed(() => position.value?.heading != null)

  async function inspect() {
    permissions.value = await dependencies.location.queryPermissions()
  }

  async function enable() {
    requesting.value = true
    error.value = null
    try {
      permissions.value = await dependencies.location.requestPermissions()
      dependencies.location.start(
        (next) => { position.value = next },
        (message) => { error.value = message },
      )
    } catch (reason) {
      error.value = toAppError(reason, '無法啟用定位').message
    } finally {
      requesting.value = false
    }
  }

  function stop() {
    dependencies.location.stop()
  }

  return { position, permissions, error, requesting, hasHeading, inspect, enable, stop }
})
