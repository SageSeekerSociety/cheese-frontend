import type { ApiType } from '..'

import { requestInterceptor, requestInterceptorErr, responseInterceptor, responseInterceptorErr } from '../Interceptors'
import { API_BASE_URL, NEW_API_BASE_URL } from '../utils'
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
export default new Api(option)
export const NewApiInstance = new Api(newOption)
