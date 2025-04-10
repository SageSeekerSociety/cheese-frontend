import type { BusinessError } from '@/network/types/error'

import { toast } from 'vuetify-sonner'

// 定义错误处理器类型
export type ErrorHandler<T extends Error = Error> = (error: T) => Promise<boolean> | boolean

// 定义不同类型错误的处理映射
interface ErrorHandlers {
  [errorName: string]: ErrorHandler
}

// 默认错误处理配置
interface ErrorHandlerOptions {
  showToast?: boolean
  defaultMessage?: string
}

class ErrorHandlerService {
  private handlers: ErrorHandlers = {}
  private defaultOptions: ErrorHandlerOptions = {
    showToast: true,
    defaultMessage: '操作失败',
  }

  // 注册错误处理器
  register<T extends Error>(errorName: string, handler: ErrorHandler<T>) {
    this.handlers[errorName] = handler as ErrorHandler
    return this
  }

  // 处理错误
  async handle(error: Error, options?: ErrorHandlerOptions): Promise<boolean> {
    console.error('Error caught:', error)

    const opts = { ...this.defaultOptions, ...options }

    // 判断是否为业务错误
    if ('name' in error && error.name && this.handlers[error.name]) {
      // 调用已注册的错误处理器
      return await this.handlers[error.name](error)
    }

    // 如果是业务错误但没有特定处理器
    if ('code' in error && (error as BusinessError).code) {
      if (opts.showToast) {
        toast.error(error.message || opts.defaultMessage || '操作失败')
      }
      return false
    }

    // 未知错误
    if (opts.showToast) {
      toast.error(opts.defaultMessage || '操作失败')
    }

    return false
  }

  // 包装 async 函数，提供自动错误处理
  async withErrorHandling<T>(fn: () => Promise<T>, options?: ErrorHandlerOptions): Promise<T | undefined> {
    try {
      const result = await fn()
      return result
    } catch (error) {
      await this.handle(error as Error, options)
      return undefined
    }
  }
}

// 创建单例
const errorHandler = new ErrorHandlerService()

errorHandler.register('TeamLockedError', (error) => {
  if (error instanceof Error && 'error' in error && (error as any).error?.data) {
    const data = (error as any).error.data
    toast.warning(`团队已锁定：参与了任务 ${data.lockingTasks}`)
  } else {
    toast.warning('团队已锁定，无法修改成员')
  }
  return false
})

errorHandler.register('AccessDeniedError', (error) => {
  toast.error('您没有权限执行此操作')
  return false
})

errorHandler.register('PermissionDeniedError', (error) => {
  toast.error('您没有权限执行此操作')
  return false
})

export default errorHandler
