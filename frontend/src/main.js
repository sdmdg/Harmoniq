import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setupPlaytimeWatcher } from './utils/playTimeWatch'

import App from './App.vue'
import router from './router'

import './assets/main.css'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
setupPlaytimeWatcher()
app.mount('#app')
