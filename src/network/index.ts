// 引入axios以及一些类型
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ResponseDataType } from './types'

import axios from 'axios'

import { isAxiosResponse } from './utils'

export interface Interceptor {
  requestInterceptor: (
    res: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  requestInterceptorErr?: (error: any) => any
  responseInterceptor: (res: AxiosResponse) => AxiosResponse
  responseInterceptorErr?: (error: any) => any
}

export interface ApiType {
  cfg: AxiosRequestConfig
  interceptor: Interceptor
}

export default class Api {
  instance: AxiosInstance

  config: AxiosRequestConfig

  interceptor: Interceptor

  constructor(option: ApiType) {
    this.config = option.cfg
    this.interceptor = option.interceptor
    // 配置全局参数
    this.instance = axios.create(this.config)
    // 拦截器
    // 配置请求拦截器
    this.instance.interceptors.request.use(this.interceptor.requestInterceptor, this.interceptor?.requestInterceptorErr)
    // 配置响应拦截器
    this.instance.interceptors.response.use(
      this.interceptor.responseInterceptor,
      this.interceptor?.responseInterceptorErr
    )
  }

  // 加入泛型限定，返回数据类型为T，请求的数据类型为R
  async request<T, R = any>(config: AxiosRequestConfig<R>): Promise<ResponseDataType<T>> {
    const res = await this.instance.request<ResponseDataType<T>, AxiosResponse<ResponseDataType<T>>, R>(config)
    if (isAxiosResponse(res)) {
      return res.data
    }
    return res
  }
}
