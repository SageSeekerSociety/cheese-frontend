/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'material-symbols/rounded.css'

import 'vuetify/styles'

import { h } from 'vue'
// Composables
import { createVuetify } from 'vuetify'
import { md2 } from 'vuetify/blueprints'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  blueprint: md2,
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#F57F17',
          secondary: '#5CBBF6',
          'page-background': '#EEEEEE',
          'logo-primary': '#FF9500',
          'logo-secondary': '#FFE600',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
      mds: {
        component: (props) =>
          h(
            props.tag,
            { class: ['material-symbols-rounded'], style: { fontSize: 'calc(var(--v-icon-size-multiplier) * 1em)' } },
            props.icon as string
          ),
      },
    },
  },
  defaults: {
    VTextField: {
      varient: 'outlined',
      density: 'comfortable',
    },
    VCheckbox: {
      density: 'compact',
      hideDetails: 'auto',
    },
    VAlert: {
      variant: 'tonal',
    },
    VBtn: {
      rounded: 'lg',
    },
  },
})
