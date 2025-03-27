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
      component: () => import('@/views/tasks/Detail.vue'),
      children: [
        {
          path: '',
          name: 'TasksDetail',
          component: () => import('@/views/tasks/detail/Overview.vue'),
          meta: {
            title: '赛题概览',
          },
        },
        {
          path: 'submissions',
          name: 'TasksSubmissions',
          component: () => import('@/views/tasks/detail/Submissions.vue'),
          meta: {
            title: '提交记录',
          },
        },
        {
          path: 'participants',
          name: 'TasksParticipants',
          component: () => import('@/views/tasks/detail/Participants.vue'),
          meta: {
            title: '参与者管理',
          },
        },
        {
          path: 'submit',
          name: 'TasksSubmit',
          component: () => import('@/views/tasks/detail/Submit.vue'),
          meta: {
            title: '提交表单',
          },
        },
        {
          path: 'ai-advice',
          name: 'TasksAIAdvice',
          component: () => import('@/views/tasks/detail/AIAdvice.vue'),
          meta: {
            title: '启星研导',
          },
        },
      ],
    },
  ],
} as RouteRecordRaw
