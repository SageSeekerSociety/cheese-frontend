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
      redirect: { name: 'SpacesDetailTasks' },
      children: [
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
        {
          path: 'manage/topics',
          name: 'SpacesDetailManageTopics',
          component: () => import('@/views/spaces/detail/ManageTopics.vue'),
        },
        {
          path: 'manage/categories',
          name: 'SpacesDetailManageCategories',
          component: () => import('@/views/spaces/detail/ManageCategories.vue'),
        },
      ],
    },
  ],
} as RouteRecordRaw
