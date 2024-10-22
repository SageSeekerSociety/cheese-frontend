import type { InternalAxiosRequestConfig } from 'axios'

import AccountService from '@/services/account'

export default (config: InternalAxiosRequestConfig) => {
  const token = AccountService.accessToken
  const isRefreshingToken = config.url?.includes('/users/auth/refresh-token')
  if (AccountService.loggedIn && token && !isRefreshingToken) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}
