// src/packages/event-bus/plugin.ts
import { App, Plugin } from 'vue'

import { createEventBus, EventBusResult, EventMap } from './index'

export interface EventBusPluginOptions<E extends EventMap> {
  /**
   * 事件总线结果对象，包含bus实例和useEventBus钩子，不提供则内部创建一个
   */
  eventBusResult?: EventBusResult<E>

  /**
   * 全局事件总线在应用实例上的属性名称
   * @default '$eventBus'
   */
  property?: string

  /**
   * 是否将事件总线安装到全局 window 对象上
   * @default false
   */
  attachToWindow?: boolean

  /**
   * 全局事件总线在 window 对象上的属性名称
   * @default '__EVENT_BUS__'
   */
  windowProperty?: string
}

/**
 * 创建 Vue 事件总线插件
 * @param options 插件配置项
 * @returns Vue 插件
 */
export function createEventBusPlugin<E extends EventMap>(options: EventBusPluginOptions<E> = {}): Plugin {
  const eventBusResult = options.eventBusResult || createEventBus<E>()

  const { property = '$eventBus', attachToWindow = false, windowProperty = '__EVENT_BUS__' } = options

  // 如果需要，将事件总线附加到 window 对象
  if (attachToWindow && typeof window !== 'undefined') {
    ;(window as any)[windowProperty] = eventBusResult.bus
  }

  return {
    install(app: App) {
      // 将事件总线添加到 Vue 应用实例
      app.config.globalProperties[property] = eventBusResult.bus

      // 提供事件总线和useEventBus钩子，可以在任何组件中通过 inject 获取
      app.provide('eventBus', eventBusResult.bus)
      app.provide('useEventBus', eventBusResult.useEventBus)
    },
  }
}
