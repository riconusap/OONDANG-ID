import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import router from './router'
import { initializeMockStorage } from './services/apiClient'
import './style.css'
import App from './App.vue'

// Siapkan penyimpanan mock data awal untuk local storage
initializeMockStorage()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vue3Toastify, {
  autoClose: 3500,
  position: 'top-right',
  theme: 'light',
  hideProgressBar: false,
  pauseOnHover: true,
} as ToastContainerOptions)

app.mount('#app')
