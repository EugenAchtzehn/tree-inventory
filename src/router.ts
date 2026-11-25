import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/map' },
    { path: '/login', name: 'login', component: () => import('@/modules/auth/pages/LoginPage.vue'), meta: { public: true } },
    { path: '/register', name: 'register', component: () => import('@/modules/auth/pages/RegisterPage.vue'), meta: { public: true } },
    { path: '/map', name: 'map', component: () => import('@/modules/map/MapPage.vue') },
    { path: '/account', name: 'account', component: () => import('@/modules/account/AccountPage.vue') },
    { path: '/trees', name: 'trees', component: () => import('@/modules/inventory/pages/TreeListPage.vue') },
    { path: '/trees/:id', name: 'tree-detail', component: () => import('@/modules/inventory/pages/TreeDetailPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/map' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restore()
  if (!to.meta.public && !auth.authenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.public && auth.authenticated && (to.name === 'login' || to.name === 'register')) return { name: 'map' }
  return true
})
