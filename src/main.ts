/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

import 'editorjs-latex/dist/editorjs-latex.bundle.css'
import 'katex/dist/katex.min.css'
import '@/styles/content.scss'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'
// Import your language translation files
import translation from 'zod-i18n-map/locales/zh-CN/zod.json'
import AccountService from '@/services/account'

AccountService.init()

const app = createApp(App).use(Viewer)

registerPlugins(app)

app.mount('#app')

// Initialize i18next
i18next.init({
  lng: 'zh-CN',
  resources: {
    'zh-CN': {
      zod: translation,
    },
  },
})
z.setErrorMap(zodI18nMap)
