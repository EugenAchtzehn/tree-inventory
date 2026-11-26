<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import AuthShell from '../components/AuthShell.vue'
import { useAuthStore } from '../store'
import { loginInputSchema } from '../types'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const form = reactive({ email: '', password: '' })
const errors = reactive<Record<string, string>>({})

async function submit() {
  Object.keys(errors).forEach((key) => delete errors[key])
  const result = loginInputSchema.safeParse(form)
  if (!result.success) {
    for (const issue of result.error.issues) errors[String(issue.path[0])] = issue.message
    return
  }
  try {
    await auth.login(result.data)
    await router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : '/map')
  } catch { /* store renders the error */ }
}
</script>

<template>
  <AuthShell title="歡迎回來" subtitle="登入後開始今天的戶外盤點">
    <form class="grid gap-5" @submit.prevent="submit">
      <Message v-if="auth.error" severity="error" :closable="false">{{ auth.error }}</Message>
      <div class="field-stack">
        <label for="email">Email</label>
        <InputText id="email" v-model="form.email" type="email" autocomplete="username" fluid :invalid="!!errors.email" />
        <small class="field-error">{{ errors.email }}</small>
      </div>
      <div class="field-stack">
        <label for="password">密碼</label>
        <Password id="password" v-model="form.password" autocomplete="current-password" :feedback="false" toggle-mask fluid :invalid="!!errors.password" />
        <small class="field-error">{{ errors.password }}</small>
      </div>
      <Button type="submit" label="登入" icon="pi pi-sign-in" :loading="auth.loading" fluid />
      <div class="calcite-note text-sm leading-6">
        <strong class="text-[#141414]"><i class="pi pi-info-circle mr-2 text-[#007ac2]" />Demo 帳號</strong><br />demo@tree.tw<br />TreeDemo123!
      </div>
      <p class="m-0 text-center text-sm text-[#4a4a4a]">還沒有帳號？ <RouterLink to="/register" class="font-semibold text-[#00619b]">前往註冊</RouterLink></p>
    </form>
  </AuthShell>
</template>
