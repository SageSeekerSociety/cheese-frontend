import type { AxiosError } from 'axios'
import type { ResponseDataType } from '../../types'

import ApiInstance from '../../api'
import { UserApi } from '../../api/users'
import { messageFailed } from '../../utils/showMessage'
import { Local } from '../../utils/storage'

import router from '@/router'
import AccountService from '@/services/account'

const MAX_ERROR_COUNT = 5

const queue: ((t: string) => any)[] = []
let currentCount = 0
let isRefreshing = false
/*
如使用react-router / vue-route请将 `window.location.replace('/login')` 推荐替换对应Api方法
*/
export default async function refreshToken(error: AxiosError<ResponseDataType>) {
  const { config } = error
  if (!config) return Promise.reject(error)
  const logout = () => {
    messageFailed('身份过期，请重新登录')
    router.replace('/account/signin')
    Local.clear()
    return Promise.reject(error)
  }
  if (config.url?.includes('refresh')) {
    logout()
  }
  if (!isRefreshing) {
    isRefreshing = true
    if (currentCount > MAX_ERROR_COUNT) {
      logout()
    }
    currentCount += 1
    console.log(`refresh token ${currentCount}`)

    try {
      const {
        data: { accessToken, user },
      } = await UserApi.refreshAccessToken()
      console.log('refresh token success', accessToken, user)
      Local.set('accessToken', accessToken)
      AccountService.login(accessToken, user)
      currentCount = 0
      // 重新请求
      queue.forEach((cb) => cb(accessToken))
      queue.splice(0)
      console.log('re-request', config)
      return ApiInstance.request<any>(config)
    } catch {
      messageFailed('请重新登录')
      Local.clear()
      router.replace('/account/signin')
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  } else {
    return new Promise((resolve) => {
      // 缓存网络请求，等token刷新后直接执行
      queue.push((newToken: string) => {
        Reflect.set(config.headers!, 'Authorization', `Bearer ${newToken}`)
        console.log('queue', config)
        resolve(ApiInstance.request<any>(config))
      })
    })
  }
}
