import type { AxiosError } from 'axios'
import type { ResponseDataType } from '../types/index'

import { BusinessError, ServerError, SudoRequiredError } from '../types/error'

import refreshToken from './hooks/refreshToken'

export default (error: AxiosError<ResponseDataType>) => {
  const statusCode = error.response?.status
  const path = error.response?.config.url

  // 处理特殊错误
  if (statusCode === 401) {
    if (path?.startsWith('/users/auth')) {
      throw createError(error)
    }
    // Token 过期，尝试刷新
    return refreshToken(error)
  }

  // 403 错误可能是 SudoRequired 或其他业务错误
  if (statusCode === 403) {
    throw createBusinessError(error)
  }

  // 抛出适当类型的错误
  throw createError(error)
}

// 创建业务错误对象（特殊处理 SudoRequired）
function createBusinessError(error: AxiosError<ResponseDataType>): Error {
  const response = error.response?.data

  // 特殊处理 SudoRequired 错误
  if (response?.error?.name === 'SudoRequiredError' || response?.message?.includes('SudoRequiredError')) {
    return new SudoRequiredError(response.message)
  }

  // 处理带有详细错误信息的响应
  if (response?.error?.name) {
    return new BusinessError(response.message, 403, response.error)
  }

  // 返回通用业务错误
  return new BusinessError(response?.message || '无权限执行此操作', 403)
}

// 创建一般错误对象
function createError(error: AxiosError<ResponseDataType>): Error {
  const response = error.response?.data
  const statusCode = error.response?.status || 500

  if (!response) {
    return new Error(error.message || '网络请求失败')
  }

  // 处理带有详细错误信息的响应
  if (response.error?.name) {
    return new BusinessError(response.message, statusCode, response.error)
  }

  // 其他服务器错误
  return new ServerError(response.message || '服务器错误', statusCode)
}
