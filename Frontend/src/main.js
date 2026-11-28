import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { installSessionExpiration } from './session.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
installSessionExpiration(router)

app.mount('#app')