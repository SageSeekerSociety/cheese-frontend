// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { refreshTitle } from '@/utils/title'

import AccountRoutes from './account'
import GroupRoutes from './group'
import HomeRoutes from './home'
import UserRoutes from './user'
import QuestionRoutes from './question'

const routes = [AccountRoutes, GroupRoutes, HomeRoutes, UserRoutes, QuestionRoutes]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  refreshTitle(to)
  return true
})

export default router
