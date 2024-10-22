/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

import 'editorjs-latex/dist/editorjs-latex.bundle.css'
import 'katex/dist/katex.min.css'
import '@/styles/content.scss'
import '@/styles/fonts.css'

import 'dayjs/locale/zh-cn'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

// Components
// Composables
import { createApp } from 'vue'
import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
// Import your language translation files
import translation from 'zod-i18n-map/locales/zh-CN/zod.json'

import App from './App.vue'
import { registerDirectives } from './directives'

// Plugins
import { registerPlugins } from '@/plugins'
import AccountService from '@/services/account'

AccountService.init()

const app = createApp(App)

registerPlugins(app)
registerDirectives(app)

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
