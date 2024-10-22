/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import 'viewerjs/dist/viewer.css'

// Types
import type { App } from 'vue'

import viewer from 'v-viewer'

import i18n from '../i18n'
import router from '../router'
import pinia from '../store'

import { createDialogPlugin } from './dialog'
import { vuetifyProTipTap } from './tiptap'
import vuetify from './vuetify'

export function registerPlugins(app: App) {
  app.use(i18n).use(vuetify).use(router).use(pinia).use(viewer).use(vuetifyProTipTap).use(createDialogPlugin)
}
