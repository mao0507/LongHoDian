import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
// Atlassian Design System CSS Reset
import '@atlaskit/css-reset/dist/bundle.css'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化認證狀態
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
