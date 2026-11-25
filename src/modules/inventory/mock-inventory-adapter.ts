import { AppError } from '@/shared/errors'
import type { JsonStorage } from '@/shared/storage'
import { createTreeInputSchema, type CreateTreeInput, type TreeInventoryGateway, type TreeRecord, type TreeSpecies } from './types'

const TREES_KEY = 'tree-inventory.trees'
const delay = (milliseconds = 250) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const SPECIES: TreeSpecies[] = [
  { id: 'ficus-microcarpa', name: '榕樹' },
  { id: 'cinnamomum-camphora', name: '樟樹' },
  { id: 'koelreuteria-elegans', name: '臺灣欒樹' },
  { id: 'liquidambar-formosana', name: '楓香' },
  { id: 'delonix-regia', name: '鳳凰木' },
  { id: 'terminalia-mantaly', name: '小葉欖仁' },
]

export class MockInventoryAdapter implements TreeInventoryGateway {
  constructor(private readonly storage: JsonStorage) {}

  async listSpecies(): Promise<TreeSpecies[]> {
    await delay()
    return structuredClone(SPECIES)
  }

  async createTree(input: CreateTreeInput): Promise<TreeRecord> {
    const validated = createTreeInputSchema.safeParse(input)
    if (!validated.success) {
      throw new AppError('VALIDATION', '盤點資料格式不正確')
    }
    const species = SPECIES.find((item) => item.id === input.speciesId)
    if (!species) throw new AppError('VALIDATION', '找不到選取的樹種')

    const now = new Date().toISOString()
    const record: TreeRecord = {
      ...validated.data,
      id: crypto.randomUUID(),
      species: { ...species },
      createdBy: 'demo-user',
      createdAt: now,
    }
    const trees = this.storage.read<TreeRecord[]>(TREES_KEY, [])
    this.storage.write(TREES_KEY, [record, ...trees])
    await delay(450)
    return record
  }

  async listTrees(): Promise<TreeRecord[]> {
    await delay()
    return this.storage.read<TreeRecord[]>(TREES_KEY, [])
  }

  async getTree(id: string): Promise<TreeRecord | null> {
    const trees = await this.listTrees()
    return trees.find((tree) => tree.id === id) ?? null
  }
}
