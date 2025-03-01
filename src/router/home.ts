import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/',
  name: 'Home',
  component: () => import('@/layouts/home/Home.vue'),
  children: [
    {
      path: '',
      name: 'HomeDefault',
      component: () => import('@/views/home/Default.vue'),
      meta: {
        title: '首页',
      },
    },
    {
      path: 'explore',
      name: 'HomeExplore',
      component: () => import('@/views/home/Explore.vue'),
      meta: {
        title: '发现',
      },
    },
  ],
  beforeEnter: (to, _, next) => {
    next({ name: 'SpacesDefault' })
  },
} as RouteRecordRaw
