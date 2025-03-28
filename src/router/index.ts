import type { RouteRecordRaw } from 'vue-router'

import { createRouter, createWebHistory } from 'vue-router'

import { refreshTitle } from '@/utils/title'

import AccountRoutes from './account'
import GroupRoutes from './group'
import HomeRoutes from './home'
import ProjectsRoutes from './projects'
import QuestionRoutes from './question'
import SpacesRoutes from './spaces'
import TasksRoutes from './tasks'
import TeamsRoutes from './teams'
import UserRoutes from './user'

const routes: RouteRecordRaw[] = [
  AccountRoutes,
  GroupRoutes,
  HomeRoutes,
  UserRoutes,
  ProjectsRoutes,
  QuestionRoutes,
  SpacesRoutes,
  TasksRoutes,
  TeamsRoutes,
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
  if (to.meta.disabled) {
    return false
  }
  refreshTitle(to)
  return true
})

export default router
