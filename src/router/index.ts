// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { refreshTitle } from '@/utils/title'

import AccountRoutes from './account'
import GroupRoutes from './group'
import HomeRoutes from './home'
import UserRoutes from './user'
import QuestionRoutes from './question'

const routes = [
  AccountRoutes,
  GroupRoutes,
  HomeRoutes,
  UserRoutes,
  QuestionRoutes,
  {
    name: 'Search',
    path: '/search',
    component: () => import('@/views/searches/Index.vue'),
    meta: {
      title: '搜索',
    },
  },
  {
    name: 'NotFound',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '页面未找到',
    },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  refreshTitle(to)
  return true
})

export default router
