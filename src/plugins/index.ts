/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'
import i18n from '../i18n'
import viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  app.use(i18n).use(vuetify).use(router).use(pinia).use(viewer)
}
