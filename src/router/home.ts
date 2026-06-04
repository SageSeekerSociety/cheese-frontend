import type { RouteRecordRaw } from 'vue-router'

import RouterPassThrough from '@/layouts/RouterPassThrough.vue'

export default {
  path: '/',
  name: 'Home',
  components: {
    default: RouterPassThrough,
    sidebar: () => import('@/components/home/HomeSidebar.vue'),
  },
  children: [
    {
      path: '',
      name: 'HomeDefault',
      meta: {
        title: '首页',
      },
      redirect: { name: 'HomeSpaces' },
    },
    {
      path: 'spaces',
      name: 'HomeSpaces',
      component: () => import('@/views/spaces/Index.vue'),
      meta: {
        title: '空间',
        isFullPage: true,
      },
    },
    {
      path: 'teams',
      name: 'HomeTeams',
      component: () => import('@/views/teams/Index.vue'),
      redirect: { name: 'HomeTeamsExplore' },
      meta: {
        title: '小队',
        isFullPage: true,
      },
      children: [
        {
          path: 'explore',
          name: 'HomeTeamsExplore',
          component: () => import('@/views/teams/Explore.vue'),
          meta: {
            title: '发现小队',
            isFullPage: true,
          },
        },
        {
          path: 'mine',
          name: 'HomeTeamsMine',
          component: () => import('@/views/teams/Mine.vue'),
          meta: {
            title: '我的小队',
            isFullPage: true,
          },
        },
        {
          path: 'pending',
          name: 'HomeTeamsPending',
          component: () => import('@/views/teams/Pending.vue'),
          meta: {
            title: '申请与邀请',
            isFullPage: true,
          },
        },
      ],
    },
  ],
} as RouteRecordRaw
