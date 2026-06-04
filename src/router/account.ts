import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/account',
  name: 'Account',
  component: () => import('@/layouts/account/Account.vue'),
  meta: {
    hideAppBar: true,
  },
  children: [
    {
      path: 'signin',
      name: 'SignIn',
      component: () => import('@/views/account/SignIn.vue'),
      meta: {
        title: '登录',
      },
    },
    {
      path: 'signup',
      name: 'SignUpStart',
      component: () => import('@/views/account/signup/Start.vue'),
      meta: {
        title: '注册',
      },
    },
    {
      path: 'signup/verify-email',
      name: 'SignUpVerifyEmail',
      component: () => import('@/views/account/signup/VerifyEmail.vue'),
      meta: {
        title: '注册',
      },
    },
    {
      path: 'recover/password',
      name: 'RecoverPasswordRequest',
      component: () => import('@/views/account/recover/password/Start.vue'),
      meta: {
        title: '找回密码',
      },
    },
    {
      path: 'recover/password/verify',
      name: 'RecoverPasswordVerify',
      component: () => import('@/views/account/recover/password/Verify.vue'),
      meta: {
        title: '找回密码',
      },
      beforeEnter: (to: any, from: any, next: any) => {
        if (!to.query.token) {
          next({ name: 'RecoverPasswordRequest' })
        } else {
          next()
        }
      },
    },
    {
      path: 'sudo-verify',
      name: 'SudoVerify',
      component: () => import('@/views/account/SudoVerify.vue'),
      meta: {
        title: '验证身份',
      },
    },
    {
      path: 'verify-2fa',
      name: 'Verify2FA',
      component: () => import('@/views/account/Verify2FA.vue'),
      meta: {
        title: '两步验证',
      },
    },
    {
      path: 'oauth/complete',
      name: 'OAuthComplete',
      component: () => import('@/views/account/OAuthComplete.vue'),
      meta: {
        title: 'OAuth 账户选择',
      },
    },
    {
      path: 'oauth/verify',
      name: 'OAuthVerify',
      component: () => import('@/views/account/OAuthVerify.vue'),
      meta: {
        title: 'OAuth 验证',
      },
    },
    {
      path: 'oauth/success',
      name: 'OAuthSuccess',
      component: () => import('@/views/account/OAuthSuccess.vue'),
      meta: {
        title: 'OAuth 登录成功',
      },
    },
    {
      path: 'oauth/error',
      name: 'OAuthError',
      component: () => import('@/views/account/OAuthError.vue'),
      meta: {
        title: 'OAuth 登录失败',
      },
    },
  ],
} as RouteRecordRaw
