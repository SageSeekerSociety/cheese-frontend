import type { Router } from 'vue-router'

import { SudoRequiredError } from '@/network/types/error'
import { useSudoStore } from '@/stores/sudo'

// 存储最后一次需要重试的操作
let lastOperation: (() => Promise<any>) | null = null

export async function withSudo<T>(operation: () => Promise<T>, opKey: string, opData: any, router: Router): Promise<T> {
  const sudoStore = useSudoStore()

  try {
    return await operation()
  } catch (error) {
    if (error instanceof SudoRequiredError) {
      // 存储待重试的操作标识及数据，而非直接存储函数
      sudoStore.setRetryOperation({
        opKey,
        opData,
        returnPath: router.currentRoute.value.fullPath,
      })
      // 跳转到 sudo 验证页面
      router.push('/account/sudo-verify')
      // 返回一个永远不会 resolve 的 promise
      return new Promise(() => {})
    }
    throw error
  }
}

// 检查是否需要重试
export function checkSudoRetry() {
  const sudoStore = useSudoStore()
  return sudoStore.needsRetry
}

// 清除重试状态
export function clearSudoRetry() {
  const sudoStore = useSudoStore()
  sudoStore.clearRetryState()
}

// 获取并清除最后保存的操作
export function getAndClearLastOperation() {
  const operation = lastOperation
  lastOperation = null
  return operation
}
