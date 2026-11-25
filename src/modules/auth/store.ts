import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { dependencies } from '@/app/dependencies'
import { toAppError } from '@/shared/errors'
import type { LoginInput, RegisterInput, UserProfile } from './types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)
  const authenticated = computed(() => user.value !== null)

  async function restore() {
    if (initialized.value) return
    user.value = await dependencies.auth.getCurrentUser()
    initialized.value = true
  }

  async function login(input: LoginInput) {
    loading.value = true
    error.value = null
    try {
      const session = await dependencies.auth.login(input)
      user.value = session.user
    } catch (reason) {
      error.value = toAppError(reason).message
      throw reason
    } finally {
      loading.value = false
    }
  }

  async function register(input: RegisterInput) {
    loading.value = true
    try {
      await dependencies.auth.register(input)
    } finally {
      loading.value = false
    }
  }

  async function updateName(name: string) {
    user.value = await dependencies.auth.updateProfile(name)
  }

  async function logout() {
    await dependencies.auth.logout()
    user.value = null
  }

  return { user, loading, error, initialized, authenticated, restore, login, register, updateName, logout }
})
