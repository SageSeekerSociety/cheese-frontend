import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSudoStore = defineStore('sudo', () => {
  // 存储重试前的路由，用于验证后返回
  const returnPath = ref<string | null>(null)
  // 标记是否需要重试
  const needsRetry = ref(false)
  // 存储待重试操作的信息（操作标识和附带数据）
  const retryOperation = ref<{ opKey: string; opData?: any } | null>(null)
  // 新增：标记是否验证成功
  const isVerified = ref(false)

  // 设置重试状态及待重试操作
  const setRetryOperation = (params: { opKey: string; opData?: any; returnPath: string }) => {
    console.log(params)
    retryOperation.value = { opKey: params.opKey, opData: params.opData }
    returnPath.value = params.returnPath
    needsRetry.value = true
    isVerified.value = false // 重置验证状态
  }

  // 清除重试状态
  const clearRetryState = () => {
    returnPath.value = null
    needsRetry.value = false
    retryOperation.value = null
    isVerified.value = false // 清除验证状态
  }

  // 新增：设置验证成功状态
  const setVerified = () => {
    isVerified.value = true
  }

  return {
    returnPath,
    needsRetry,
    retryOperation,
    isVerified,
    setRetryOperation,
    clearRetryState,
    setVerified,
  }
})
