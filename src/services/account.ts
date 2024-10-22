import type { User } from '@/types/users'

import { computed, ref } from 'vue'

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
  }

  public init() {
    const accessToken = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    if (accessToken && user) {
      this.accessToken = accessToken
      this.user = JSON.parse(user)
      this.loggedIn = true
    }
  }

  public async login(accessToken: string, user: User) {
    this.loggedIn = true
    this.user = user
    this.accessToken = accessToken
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
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
