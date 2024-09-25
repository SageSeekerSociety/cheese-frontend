import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/tasks',
  component: () => import('@/layouts/tasks/Tasks.vue'),
  meta: {
    title: '赛题',
  },
  children: [
    {
      path: ':taskId',
      name: 'TasksDetail',
      component: () => import('@/views/tasks/Detail.vue'),
    },
  ],
} as RouteRecordRaw
