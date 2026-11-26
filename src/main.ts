import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import 'font-gis/css/font-gis.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import './styles.css'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { darkModeSelector: false, cssLayer: { name: 'primevue', order: 'theme, base, primevue, components, utilities' } },
  },
  locale: { emptyMessage: '沒有可顯示的資料', accept: '確定', reject: '取消' },
})
app.use(ToastService)
app.mount('#app')
