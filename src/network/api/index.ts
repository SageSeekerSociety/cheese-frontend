import type { ApiType } from '..'

import { requestInterceptor, requestInterceptorErr, responseInterceptor, responseInterceptorErr } from '../Interceptors'
import { AI_API_BASE_URL, API_BASE_URL, NEW_API_BASE_URL } from '../utils'
import Api from '..'

const option: ApiType = {
  cfg: {
    baseURL: API_BASE_URL,
    timeout: 5000,
  },
  interceptor: {
    responseInterceptor,
    requestInterceptorErr,
    requestInterceptor,
    responseInterceptorErr,
  },
}

const newOption: ApiType = {
  cfg: {
    baseURL: NEW_API_BASE_URL,
    timeout: 5000,
  },
  interceptor: {
    responseInterceptor,
    requestInterceptorErr,
    requestInterceptor,
    responseInterceptorErr,
  },
}

const aiOption: ApiType = {
  cfg: {
    baseURL: AI_API_BASE_URL,
    timeout: 30000,
  },
  interceptor: {
    responseInterceptor,
    requestInterceptorErr,
    requestInterceptor,
    responseInterceptorErr,
  },
}
export default new Api(option)
export const NewApiInstance = new Api(newOption)
export const AiApiInstance = new Api(aiOption)
