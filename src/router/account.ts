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
  ],
} as RouteRecordRaw
