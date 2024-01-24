import { InternalAxiosRequestConfig } from 'axios'
import AccountService from '@/services/account'

export default (config: InternalAxiosRequestConfig) => {
  const token = AccountService.accessToken
  if (AccountService.loggedIn && token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}
