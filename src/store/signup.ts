import { defineStore } from 'pinia'

import { UserApi } from '@/network/api/users'

export const useSignupStore = defineStore('signup', {
  state: () => ({
    submitted: false,
    username: '',
    nickname: '',
    email: '',
    password: '',
  }),
  actions: {
    async startSignup(data: { username: string; nickname: string; email: string; password: string }) {
      this.submitted = true
      this.username = data.username
      this.nickname = data.nickname
      this.email = data.email
      this.password = data.password

      return await this.sendEmailCode()
    },
    async sendEmailCode() {
      if (!this.submitted || !this.email) {
        return
      }
      return await UserApi.sendEmailCode(this.email)
    },
    async signup(emailCode: string) {
      if (!this.submitted || !this.username || !this.password || !this.email || !emailCode || !this.nickname) {
        return
      }
      return await UserApi.register({
        username: this.username,
        nickname: this.nickname,
        password: this.password,
        email: this.email,
        emailCode,
      })
    },
  },
})
