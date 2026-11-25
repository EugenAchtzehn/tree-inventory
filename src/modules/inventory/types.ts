import { z } from 'zod'

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface TreeSpecies {
  id: string
  name: string
}

export const createTreeInputSchema = z.object({
  speciesId: z.string().min(1, '請選擇樹種'),
  circumferenceCm: z.number().positive('胸圍必須大於 0').max(3000, '胸圍數值過大'),
  heightM: z.number().positive('樹高必須大於 0').max(150, '樹高數值過大'),
  notes: z.string().trim().max(500, '備註不可超過 500 字'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  observedAt: z.string().datetime(),
})

export type CreateTreeInput = z.infer<typeof createTreeInputSchema>

export interface TreeRecord extends CreateTreeInput {
  id: string
  species: TreeSpecies
  createdBy: string
  createdAt: string
}

export interface TreeInventoryGateway {
  listSpecies(): Promise<TreeSpecies[]>
  createTree(input: CreateTreeInput): Promise<TreeRecord>
  listTrees(): Promise<TreeRecord[]>
  getTree(id: string): Promise<TreeRecord | null>
}
