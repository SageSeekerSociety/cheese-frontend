import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/teams',
  component: () => import('@/layouts/teams/Teams.vue'),
  meta: {
    title: '小队',
  },
  children: [
    {
      path: '',
      name: 'TeamsIndex',
      component: () => import('@/views/teams/Index.vue'),
    },
    {
      path: ':teamId',
      name: 'TeamsDetail',
      component: () => import('@/views/teams/Detail.vue'),
      children: [
        {
          path: '',
          name: 'TeamsDetailDefault',
        },
        {
          path: 'tasks',
          name: 'TeamsDetailTasks',
          component: () => import('@/views/teams/detail/Tasks.vue'),
        },
        {
          path: 'members',
          name: 'TeamsDetailMembers',
          component: () => import('@/views/teams/detail/Members.vue'),
        },
      ],
      beforeEnter: (to, _, next) => {
        console.log('to', to)
        if (to.name === 'TeamsDetailDefault' || to.name === 'TeamsDetail') {
          next({ name: 'TeamsDetailMembers', params: to.params })
        } else {
          next()
        }
      },
    },
  ],
} as RouteRecordRaw
