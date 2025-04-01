import { defineStore } from 'pinia'

import { UserApi } from '@/network/api/users'

interface SignupState {
  username: string
  nickname: string
  email: string
  srpSalt: string
  srpVerifier: string
}

export const useSignupStore = defineStore('signup', {
  state: (): SignupState => ({
    username: '',
    nickname: '',
    email: '',
    srpSalt: '',
    srpVerifier: '',
  }),

  actions: {
    async startSignup(data: {
      username: string
      nickname: string
      email: string
      srpSalt: string
      srpVerifier: string
    }) {
      // 保存注册信息
      this.username = data.username
      this.nickname = data.nickname
      this.email = data.email
      this.srpSalt = data.srpSalt
      this.srpVerifier = data.srpVerifier

      // 发送验证邮件
      if (import.meta.env.VITE_DISABLE_EMAIL_VERIFY !== 'true') {
        await UserApi.sendEmailCode(data.email)
      }
    },

    async signup(emailCode: string) {
      const response = await UserApi.register({
        username: this.username,
        nickname: this.nickname,
        srpSalt: this.srpSalt,
        srpVerifier: this.srpVerifier,
        email: this.email,
        emailCode,
      })

      // 清空 store
      this.$reset()

      return response
    },
  },
})
