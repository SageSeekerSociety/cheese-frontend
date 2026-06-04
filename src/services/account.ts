import type { User } from '@/types/users'

import { computed, ref } from 'vue'

import { UserApi } from '@/network/api/users'

export class AccountService {
  _loggedIn = ref(false)
  _user = ref<User | null>(null)
  _accessToken: string | null = null

  public get loggedIn() {
    return this._loggedIn.value
  }

  public set loggedIn(value) {
    this._loggedIn.value = value
  }

  public get user() {
    return this._user.value
  }

  public set user(value) {
    this._user.value = value
  }

  public get accessToken() {
    return this._accessToken
  }

  public set accessToken(value) {
    this._accessToken = value
    if (value) {
      localStorage.setItem('accessToken', value)
    } else {
      localStorage.removeItem('accessToken')
    }
  }

  public async updateUserInfo() {
    if (!this.loggedIn || !this.accessToken) return

    try {
      const { data } = await UserApi.getCurrentUser()
      if (data.user) {
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (error) {
      console.error('Failed to update user info:', error)
    }
  }

  public async init() {
    const accessToken = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    if (accessToken && user) {
      this.accessToken = accessToken
      this.user = JSON.parse(user)
      this.loggedIn = true
      // 初始化完成后更新用户信息
      await this.updateUserInfo()
    }
  }

  public async login(accessToken: string, user?: User) {
    this.loggedIn = true
    this.accessToken = accessToken
    localStorage.setItem('accessToken', accessToken)

    if (user) {
      // 如果提供了用户信息，直接使用
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      // 如果没有提供用户信息（如 OAuth 登录），获取完整的用户信息
      await this.updateUserInfo()
    }
  }

  public async logout() {
    this.loggedIn = false
    this.user = null
    this._accessToken = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }
}

const accountService = new AccountService()

export default accountService

export const currentUserId = computed(() => accountService.user?.id)

export const currentUserName = computed(() => accountService.user?.username)
