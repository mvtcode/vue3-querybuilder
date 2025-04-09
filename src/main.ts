import './assets/main.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import i18n from './i18n'

const app = createApp(App)
app.use(ElementPlus)
app.use(i18n)
app.mount('#app')
