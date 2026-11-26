<script setup lang="ts">
import { reactive, watch } from 'vue'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import type { GeoPoint, TreeSpecies } from '../types'
import { createTreeInputSchema, type CreateTreeInput } from '../types'

const props = defineProps<{ visible: boolean; point: GeoPoint | null; species: TreeSpecies[]; saving: boolean }>()
const emit = defineEmits<{ 'update:visible': [value: boolean]; save: [input: CreateTreeInput]; cancel: [] }>()
const form = reactive<{ speciesId: string; circumferenceCm: number | null; heightM: number | null; notes: string }>({ speciesId: '', circumferenceCm: null, heightM: null, notes: '' })
const errors = reactive<Record<string, string>>({})

watch(() => props.visible, (visible) => {
  if (visible) {
    form.speciesId = ''
    form.circumferenceCm = null
    form.heightM = null
    form.notes = ''
    Object.keys(errors).forEach((key) => delete errors[key])
  }
})

function close() {
  emit('update:visible', false)
  emit('cancel')
}

function submit() {
  if (!props.point) return
  Object.keys(errors).forEach((key) => delete errors[key])
  const result = createTreeInputSchema.safeParse({
    ...form,
    latitude: props.point.latitude,
    longitude: props.point.longitude,
    observedAt: new Date().toISOString(),
  })
  if (!result.success) {
    for (const issue of result.error.issues) errors[String(issue.path[0])] = issue.message
    return
  }
  emit('save', result.data)
}
</script>

<template>
  <Drawer :visible="visible" position="bottom" class="!h-[min(82dvh,46rem)] !border-t !border-[#bfbfbf]" @update:visible="emit('update:visible', $event)" @hide="!saving && emit('cancel')">
    <template #header>
      <div><p class="calcite-eyebrow">New observation</p><h2 class="m-0 text-xl font-semibold">樹木詳細資料</h2><p class="mb-0 mt-1 text-sm text-[#6b6b6b]">座標已確認，完成核心盤點欄位</p></div>
    </template>
    <form class="mx-auto grid max-w-xl gap-4 pb-8" @submit.prevent="submit">
      <div class="field-stack">
        <label for="species">樹種</label>
        <Select id="species" v-model="form.speciesId" :options="species" option-label="name" option-value="id" placeholder="選擇樹種" filter fluid :invalid="!!errors.speciesId" />
        <small class="field-error">{{ errors.speciesId }}</small>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="field-stack"><label for="circumference">胸圍（cm）</label><InputNumber id="circumference" v-model="form.circumferenceCm" :min-fraction-digits="0" :max-fraction-digits="1" fluid :invalid="!!errors.circumferenceCm" /><small class="field-error">{{ errors.circumferenceCm }}</small></div>
        <div class="field-stack"><label for="height">樹高（m）</label><InputNumber id="height" v-model="form.heightM" :min-fraction-digits="0" :max-fraction-digits="1" fluid :invalid="!!errors.heightM" /><small class="field-error">{{ errors.heightM }}</small></div>
      </div>
      <div class="field-stack"><label for="notes">備註</label><Textarea id="notes" v-model="form.notes" rows="4" maxlength="500" auto-resize fluid /><small class="text-right text-xs text-slate-400">{{ form.notes.length }}/500</small></div>
      <div v-if="point" class="border-l-3 border-[#007ac2] bg-[#f2f2f2] p-3 font-mono text-xs text-[#4a4a4a]">{{ point.latitude.toFixed(6) }}, {{ point.longitude.toFixed(6) }}</div>
      <div class="sticky bottom-0 grid grid-cols-[1fr_2fr] gap-3 bg-white py-2 safe-bottom">
        <Button type="button" label="取消" severity="secondary" outlined :disabled="saving" @click="close" />
        <Button type="submit" label="完成盤點" icon="pi pi-check" :loading="saving" />
      </div>
    </form>
  </Drawer>
</template>
