import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/users',
  name: 'User',
  component: () => import('@/layouts/user/User.vue'),
  children: [
    {
      path: 'settings',
      name: 'UserSettings',
      component: () => import('@/layouts/user/Settings.vue'),
      redirect: { name: 'UserSettingsProfile' },
      children: [
        {
          path: 'profile',
          name: 'UserSettingsProfile',
          component: () => import('@/views/user/settings/Profile.vue'),
        },
        {
          path: 'security',
          name: 'UserSettingsSecurity',
          component: () => import('@/views/user/settings/Security.vue'),
        },
        {
          path: 'realname',
          name: 'UserSettingsRealName',
          component: () => import('@/views/user/settings/RealName.vue'),
        },
      ],
    },
    {
      path: 'privacy-center',
      name: 'UserPrivacyCenter',
      component: () => import('@/views/user/privacy/PrivacyCenter.vue'),
      redirect: { name: 'PrivacyCenter' },
      children: [
        {
          path: '',
          name: 'PrivacyCenter',
          component: () => import('@/views/user/privacy/Overview.vue'),
        },
        {
          path: 'real-name-info',
          name: 'PrivacyCenterRealNameInfo',
          component: () => import('@/views/user/privacy/RealNameInfo.vue'),
        },
        {
          path: 'access-logs',
          name: 'PrivacyCenterAccessLogs',
          component: () => import('@/views/user/privacy/AccessLogs.vue'),
        },
        {
          path: 'data-sharing',
          name: 'PrivacyCenterDataSharing',
          component: () => import('@/views/user/privacy/DataSharing.vue'),
        },
        {
          path: 'privacy-policy',
          name: 'PrivacyCenterPolicy',
          component: () => import('@/views/user/privacy/PrivacyPolicy.vue'),
        },
      ],
    },
    {
      path: ':id',
      name: 'UserDetail',
      component: () => import('@/layouts/user/UserDetail.vue'),
      children: [
        {
          path: '',
          name: 'UserDefault',
          redirect: { name: 'UserFollowing' },
        },
        {
          path: 'following',
          name: 'UserFollowing',
          component: () => import('@/views/user/Following.vue'),
        },
        {
          path: 'follower',
          name: 'UserFollower',
          component: () => import('@/views/user/Follower.vue'),
        },
      ],
    },
  ],
} as RouteRecordRaw
