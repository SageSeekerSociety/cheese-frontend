import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/spaces',
  component: () => import('@/layouts/spaces/Spaces.vue'),
  meta: {
    title: '空间',
  },
  children: [
    {
      path: '',
      name: 'SpacesDefault',
      component: () => import('@/views/spaces/Index.vue'),
    },
    {
      path: ':spaceId',
      name: 'SpacesDetail',
      component: () => import('@/views/spaces/Detail.vue'),
      children: [
        {
          path: '',
          name: 'SpacesDetailDefault',
        },
        {
          path: 'tasks',
          name: 'SpacesDetailTasks',
          component: () => import('@/views/spaces/detail/Tasks.vue'),
        },
        {
          path: 'tasks/publish',
          name: 'SpacesDetailPublishTask',
          component: () => import('@/views/spaces/detail/PublishTask.vue'),
        },
        {
          path: 'tasks/audit',
          name: 'SpacesDetailAuditTasks',
          component: () => import('@/views/spaces/detail/AuditTask.vue'),
        },
      ],
      beforeEnter: (to, _, next) => {
        if (to.name === 'SpacesDetailDefault' || to.name === 'SpacesDetail') {
          next({ name: 'SpacesDetailTasks', params: to.params })
        } else {
          next()
        }
      },
    },
  ],
} as RouteRecordRaw
