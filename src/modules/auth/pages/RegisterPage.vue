<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import AuthShell from '../components/AuthShell.vue'
import { useAuthStore } from '../store'
import { registerInputSchema } from '../types'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const errors = reactive<Record<string, string>>({})

async function submit() {
  Object.keys(errors).forEach((key) => delete errors[key])
  const result = registerInputSchema.safeParse(form)
  if (!result.success) {
    for (const issue of result.error.issues) errors[String(issue.path[0])] = issue.message
    return
  }
  await auth.register(result.data)
  toast.add({ severity: 'success', summary: '註冊資料已送出', detail: '目前請使用 Demo 帳號登入', life: 4500 })
  await router.replace('/login')
}
</script>

<template>
  <AuthShell title="建立帳號" subtitle="先完成基本資料，正式帳號將於後端上線後啟用">
    <form class="grid gap-4" @submit.prevent="submit">
      <div v-for="field in [{ key: 'name', label: '姓名', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }]" :key="field.key" class="field-stack">
        <label :for="field.key">{{ field.label }}</label>
        <InputText :id="field.key" v-model="form[field.key as 'name' | 'email']" :type="field.type" fluid :invalid="!!errors[field.key]" />
        <small class="field-error">{{ errors[field.key] }}</small>
      </div>
      <div v-for="field in [{ key: 'password', label: '密碼' }, { key: 'confirmPassword', label: '確認密碼' }]" :key="field.key" class="field-stack">
        <label :for="field.key">{{ field.label }}</label>
        <Password :id="field.key" v-model="form[field.key as 'password' | 'confirmPassword']" :feedback="field.key === 'password'" toggle-mask fluid :invalid="!!errors[field.key]" />
        <small class="field-error">{{ errors[field.key] }}</small>
      </div>
      <Button type="submit" label="送出註冊" :loading="auth.loading" fluid />
      <Button as="router-link" to="/login" label="返回登入" severity="secondary" text fluid />
    </form>
  </AuthShell>
</template>
