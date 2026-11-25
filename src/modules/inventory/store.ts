import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dependencies } from '@/app/dependencies'
import { toAppError } from '@/shared/errors'
import type { CreateTreeInput, TreeRecord, TreeSpecies } from './types'

export const useInventoryStore = defineStore('inventory', () => {
  const trees = ref<TreeRecord[]>([])
  const species = ref<TreeSpecies[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      ;[trees.value, species.value] = await Promise.all([
        dependencies.inventory.listTrees(),
        dependencies.inventory.listSpecies(),
      ])
    } catch (reason) {
      error.value = toAppError(reason).message
    } finally {
      loading.value = false
    }
  }

  async function create(input: CreateTreeInput) {
    const tree = await dependencies.inventory.createTree(input)
    trees.value.unshift(tree)
    return tree
  }

  return { trees, species, loading, error, load, create }
})
