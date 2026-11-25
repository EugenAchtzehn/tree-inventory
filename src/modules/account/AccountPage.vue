<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import { useToast } from 'primevue/usetoast'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import AppHeader from '@/shared/AppHeader.vue'
import { toAppError } from '@/shared/errors'
import { useAuthStore } from '@/modules/auth/store'

const auth = useAuthStore()
const toast = useToast()
const form = reactive({ name: '' })
const state = reactive({ loading: false, error: '' })
watchEffect(() => { if (auth.user) form.name = auth.user.name })

async function save() {
  state.error = ''
  state.loading = true
  try {
    await auth.updateName(form.name)
    toast.add({ severity: 'success', summary: '帳戶資料已更新', life: 2500 })
  } catch (reason) {
    state.error = toAppError(reason).message
  } finally {
    state.loading = false
  }
}
</script>

<template>
  <main class="page-shell">
    <div class="content-page">
      <AppHeader title="帳戶管理" />
      <Card>
        <template #content>
          <div class="mb-7 flex items-center gap-4">
            <Avatar :label="auth.user?.name.slice(0, 1)" size="xlarge" shape="circle" class="!bg-[#dce8b7] !text-[#173f35]" />
            <div><p class="m-0 text-xl font-extrabold">{{ auth.user?.name }}</p><p class="mt-1 text-sm text-slate-500">Demo 盤點帳戶</p></div>
          </div>
          <form class="grid gap-5" @submit.prevent="save">
            <Message v-if="state.error" severity="error" :closable="false">{{ state.error }}</Message>
            <div class="field-stack"><label for="account-email">Email</label><InputText id="account-email" :model-value="auth.user?.email" disabled fluid /></div>
            <div class="field-stack"><label for="account-name">姓名</label><InputText id="account-name" v-model="form.name" fluid /></div>
            <Button type="submit" label="儲存變更" icon="pi pi-check" :loading="state.loading" />
          </form>
          <div class="mt-8 border-t border-slate-200 pt-6">
            <h2 class="m-0 text-base font-bold">密碼與安全性</h2>
            <p class="mb-0 text-sm leading-6 text-slate-500">變更密碼功能將在正式後端帳戶系統上線後提供。</p>
          </div>
        </template>
      </Card>
    </div>
  </main>
</template>
