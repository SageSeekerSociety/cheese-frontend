import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/spaces',
  name: 'Spaces',
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
          beforeEnter: (to, _, next) => {
            if (!to.query.type) {
              next({ ...to, query: { type: 'all' } })
            } else {
              next()
            }
          },
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
        {
          path: 'templates',
          name: 'SpacesDetailManageTemplates',
          component: () => import('@/views/spaces/detail/ManageTemplates.vue'),
        },
        {
          path: 'templates/create',
          name: 'SpacesDetailCreateTemplate',
          component: () => import('@/views/spaces/detail/TemplateForm.vue'),
        },
        {
          path: 'templates/:templateIndex/edit',
          name: 'SpacesDetailEditTemplate',
          component: () => import('@/views/spaces/detail/TemplateForm.vue'),
        },
        {
          path: 'select-template',
          name: 'SpacesDetailSelectTemplate',
          component: () => import('@/views/spaces/detail/SelectTemplate.vue'),
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
