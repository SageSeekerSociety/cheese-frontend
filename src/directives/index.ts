import 'resize-observer-polyfill'

import type { App } from 'vue'

import { debounce } from 'lodash-es'

export function registerDirectives(app: App) {
  app.directive('observe-height', {
    beforeMount(el, binding) {
      let recordHeight = 0
      const onHeightChange = debounce((height) => {
        if (height !== recordHeight) {
          recordHeight = height
          binding.value(height)
        }
      }, 100)
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          console.log(entry)
          onHeightChange(entry.contentRect.height)
        }
      })
      observer.observe(el)
    },
  })
}
