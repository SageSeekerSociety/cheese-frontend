// cursor-directive.ts
import { DirectiveBinding, ObjectDirective } from 'vue'

import { insertBlinkingCursor, removeBlinkingCursor } from '../utils/cursor-utils'

export interface BlinkingCursorOptions {
  isReasoning?: boolean
  isStreaming?: boolean
}

export const vBlinkingCursor: ObjectDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const options = (binding.value as BlinkingCursorOptions) || {}

    // 只有在流式生成内容时才插入光标
    if (options.isStreaming) {
      insertBlinkingCursor(el, options.isReasoning || false)
    } else {
      removeBlinkingCursor(el)
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const options = (binding.value as BlinkingCursorOptions) || {}

    // 只有在流式生成内容时才插入光标
    if (options.isStreaming) {
      requestAnimationFrame(() => {
        insertBlinkingCursor(el, options.isReasoning || false)
      })
    } else {
      removeBlinkingCursor(el)
    }
  },

  unmounted(el: HTMLElement) {
    // 确保在指令销毁时移除光标
    removeBlinkingCursor(el)
  },
}

// 用法示例:
// <div v-html="renderedContent" v-blinking-cursor="{ isReasoning: true, isStreaming: true }"></div>
