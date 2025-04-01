import type { AxiosError } from 'axios'
import type { ResponseDataType } from '../types/index'

import { ServerError, SudoRequiredError } from '../types/error'

import forbidden from './hooks/forbidden'
import refreshToken from './hooks/refreshToken'

const handleError = (error: AxiosError<ResponseDataType>) => {
  const response = error.response?.data
  if (response && response.message) {
    return Promise.reject(new ServerError(response.message, response.code))
  }
  return Promise.reject(error)
}

export default (error: AxiosError<ResponseDataType>) => {
  const statusCode = error.response?.status
  const path = error.response?.config.url
  const data = error.response?.data

  // 处理403 Sudo Required的情况
  if (statusCode === 403 && data?.message?.includes('SudoRequiredError')) {
    return Promise.reject(new SudoRequiredError(data.message))
  }

  switch (statusCode) {
    case 401:
      if (path?.startsWith('/users/auth')) {
        return handleError(error)
      }
      // 一些操作，例如：刷新令牌，如令牌刷新失败时退出到登录页面
      console.log('401 token expired')
      return refreshToken(error)
    case 403:
      return forbidden(error)
    default:
      return handleError(error)
  }
}
