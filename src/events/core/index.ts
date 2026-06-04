// src/packages/event-bus/index.ts
import { getCurrentInstance, onUnmounted, ref, UnwrapRef } from 'vue'

/**
 * 事件处理器类型定义
 */
export type EventHandler<T> = T extends void ? () => void : (payload: T) => void

/**
 * 事件配置项接口
 */
export interface EventOptions {
  /** 是否只触发一次 */
  once?: boolean
  /** 事件优先级，数字越大优先级越高 */
  priority?: number
}

/**
 * 事件监听器接口
 */
interface EventListener<T> {
  /** 事件处理函数 */
  handler: EventHandler<T>
  /** 事件配置项 */
  options: Required<EventOptions>
}

/**
 * 事件映射类型，允许 void 作为事件类型（表示无参数事件）
 */
export type EventMap = Record<string, any | void>

/**
 * 事件总线类
 */
export class EventBus<E extends EventMap = Record<string, any>> {
  /** 存储所有事件监听器 */
  private events = new Map<keyof E, Set<EventListener<any>>>()

  /** 是否在执行中，防止在事件执行过程中修改导致的问题 */
  private isDispatching = false

  /** 待处理操作队列 */
  private pendingOperations: Array<() => void> = []

  /**
   * 注册事件监听器
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @param options 事件配置项
   * @returns 取消注册的函数
   */
  on<K extends keyof E>(eventName: K, handler: EventHandler<E[K]>, options: EventOptions = {}): () => void {
    const normalizedOptions: Required<EventOptions> = {
      once: options.once ?? false,
      priority: options.priority ?? 0,
    }

    const listener: EventListener<E[K]> = {
      handler,
      options: normalizedOptions,
    }

    const operation = () => {
      if (!this.events.has(eventName)) {
        this.events.set(eventName, new Set())
      }

      this.events.get(eventName)!.add(listener as EventListener<any>)
    }

    if (this.isDispatching) {
      this.pendingOperations.push(operation)
    } else {
      operation()
    }

    return () => this.off(eventName, handler)
  }

  /**
   * 注册一次性事件监听器
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @param options 事件配置项
   * @returns 取消注册的函数
   */
  once<K extends keyof E>(
    eventName: K,
    handler: EventHandler<E[K]>,
    options: Omit<EventOptions, 'once'> = {}
  ): () => void {
    return this.on(eventName, handler, { ...options, once: true })
  }

  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param handler 事件处理函数，不传则移除该事件的所有处理函数
   */
  off<K extends keyof E>(eventName: K, handler?: EventHandler<E[K]>): void {
    if (!this.events.has(eventName)) return

    const operation = () => {
      if (!handler) {
        this.events.delete(eventName)
        return
      }

      const listeners = this.events.get(eventName)!
      for (const listener of listeners) {
        if (listener.handler === handler) {
          listeners.delete(listener)
          break
        }
      }

      if (listeners.size === 0) {
        this.events.delete(eventName)
      }
    }

    if (this.isDispatching) {
      this.pendingOperations.push(operation)
    } else {
      operation()
    }
  }

  /**
   * 触发无参数事件
   */
  emit<K extends keyof E>(eventName: K): void

  /**
   * 触发有参数事件
   */
  emit<K extends keyof E>(eventName: K, payload: E[K]): void

  /**
   * 触发事件实现
   */
  emit<K extends keyof E>(eventName: K, payload?: any): void {
    if (!this.events.has(eventName)) return

    this.isDispatching = true

    try {
      const listeners = this.events.get(eventName)!

      // 创建一个按优先级排序的事件处理器数组
      const sortedListeners = Array.from(listeners).sort((a, b) => b.options.priority - a.options.priority)

      // 记录需要移除的一次性监听器
      const onceListeners: EventListener<any>[] = []

      // 执行所有监听器
      for (const listener of sortedListeners) {
        listener.handler(payload)

        if (listener.options.once) {
          onceListeners.push(listener)
        }
      }

      // 移除一次性监听器
      for (const listener of onceListeners) {
        listeners.delete(listener)
      }

      // 如果该事件没有监听器了，就删除该事件
      if (listeners.size === 0) {
        this.events.delete(eventName)
      }
    } finally {
      this.isDispatching = false

      // 执行待处理的操作
      if (this.pendingOperations.length > 0) {
        const operations = this.pendingOperations.slice()
        this.pendingOperations = []
        operations.forEach((operation) => operation())
      }
    }
  }

  /**
   * 检查是否存在事件监听器
   * @param eventName 事件名称
   * @param handler 事件处理函数，不传则检查是否存在该事件的任何处理函数
   */
  has<K extends keyof E>(eventName: K, handler?: EventHandler<E[K]>): boolean {
    if (!this.events.has(eventName)) return false
    if (!handler) return true

    const listeners = this.events.get(eventName)!
    for (const listener of listeners) {
      if (listener.handler === handler) return true
    }

    return false
  }

  /**
   * 获取指定事件的所有处理函数
   * @param eventName 事件名称
   */
  getListeners<K extends keyof E>(eventName: K): EventHandler<E[K]>[] {
    if (!this.events.has(eventName)) return []

    return Array.from(this.events.get(eventName)!)
      .sort((a, b) => b.options.priority - a.options.priority)
      .map((listener) => listener.handler) as EventHandler<E[K]>[]
  }

  /**
   * 获取所有已注册的事件名称
   */
  getEventNames(): Array<keyof E> {
    return Array.from(this.events.keys())
  }

  /**
   * 清空所有事件监听器
   */
  clear(): void {
    if (this.isDispatching) {
      this.pendingOperations.push(() => this.events.clear())
    } else {
      this.events.clear()
    }
  }
}

/**
 * 事件总线Hook返回类型
 */
export interface EventBusHook<E extends EventMap> {
  on: <K extends keyof E>(
    eventName: K,
    handler: E[K] extends void ? () => void : (payload: E[K]) => void,
    options?: EventOptions
  ) => () => void

  once: <K extends keyof E>(
    eventName: K,
    handler: E[K] extends void ? () => void : (payload: E[K]) => void,
    options?: Omit<EventOptions, 'once'>
  ) => () => void

  off: <K extends keyof E>(eventName: K, handler?: E[K] extends void ? () => void : (payload: E[K]) => void) => void

  emit: {
    <K extends keyof E>(eventName: K): E[K] extends void ? void : never
    <K extends keyof E>(eventName: K, payload: E[K]): E[K] extends void ? never : void
  }

  has: <K extends keyof E>(eventName: K, handler?: E[K] extends void ? () => void : (payload: E[K]) => void) => boolean

  getListeners: <K extends keyof E>(eventName: K) => (E[K] extends void ? () => void : (payload: E[K]) => void)[]

  getEventNames: () => Array<keyof E>
}

/**
 * 事件总线结果类型
 */
export interface EventBusResult<E extends EventMap> {
  /** 事件总线实例 */
  bus: EventBus<E>
  /** 在Vue组件中使用的钩子函数 */
  useEventBus: () => EventBusHook<E>
}

/**
 * 创建一个类型安全的事件总线和对应的hook
 * @returns 包含事件总线实例和useEventBus钩子的对象
 */
export function createEventBus<E extends EventMap>(): EventBusResult<E> {
  const bus = new EventBus<E>()

  /**
   * 为特定事件总线创建的自定义Hook
   */
  const useEventBus = (): EventBusHook<E> => {
    const instance = getCurrentInstance()
    const listeners = ref<
      Array<{
        eventName: keyof E
        handler: EventHandler<any>
        cleanup: () => void
      }>
    >([])

    /**
     * 注册事件监听器，组件卸载时自动清理
     */
    function on<K extends keyof E>(
      eventName: K,
      handler: E[K] extends void ? () => void : (payload: E[K]) => void,
      options?: EventOptions
    ): () => void {
      const cleanup = bus.on(eventName, handler as EventHandler<E[K]>, options)

      listeners.value.push({
        eventName: eventName as UnwrapRef<keyof E>,
        handler,
        cleanup,
      })

      return cleanup
    }

    /**
     * 注册一次性事件监听器，组件卸载时自动清理
     */
    function once<K extends keyof E>(
      eventName: K,
      handler: E[K] extends void ? () => void : (payload: E[K]) => void,
      options?: Omit<EventOptions, 'once'>
    ): () => void {
      const cleanup = bus.once(eventName, handler as EventHandler<E[K]>, options)

      listeners.value.push({
        eventName: eventName as UnwrapRef<keyof E>,
        handler,
        cleanup,
      })

      return cleanup
    }

    /**
     * 移除事件监听器
     */
    function off<K extends keyof E>(
      eventName: K,
      handler?: E[K] extends void ? () => void : (payload: E[K]) => void
    ): void {
      bus.off(eventName, handler as EventHandler<E[K]>)

      if (handler) {
        const index = listeners.value.findIndex(
          (listener) => listener.eventName === eventName && listener.handler === handler
        )

        if (index !== -1) {
          listeners.value.splice(index, 1)
        }
      } else {
        listeners.value = listeners.value.filter((listener) => listener.eventName !== eventName)
      }
    }

    /**
     * 触发事件的函数重载
     */
    function emit<K extends keyof E>(eventName: K): E[K] extends void ? void : never
    function emit<K extends keyof E>(eventName: K, payload: E[K]): E[K] extends void ? never : void
    function emit<K extends keyof E>(eventName: K, payload?: any): void {
      if (arguments.length === 1) {
        bus.emit(eventName)
      } else {
        bus.emit(eventName, payload)
      }
    }

    // 组件卸载时自动清理所有监听器
    if (instance) {
      onUnmounted(() => {
        listeners.value.forEach((listener) => listener.cleanup())
        listeners.value = []
      })
    }

    return {
      on,
      once,
      off,
      emit,
      has: bus.has.bind(bus),
      getListeners: bus.getListeners.bind(bus),
      getEventNames: bus.getEventNames.bind(bus),
    } as EventBusHook<E>
  }

  return {
    bus,
    useEventBus,
  }
}

// 导出所有模块
export default {
  EventBus,
  createEventBus,
}
