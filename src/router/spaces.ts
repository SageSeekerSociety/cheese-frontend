import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/spaces/:spaceId',
  name: 'SpacesDetail',
  components: {
    default: () => import('@/views/spaces/Detail.vue'),
    sidebar: () => import('@/components/spaces/SpaceSidebar.vue'),
  },
  meta: {
    isFullPage: true,
  },
  redirect: { name: 'SpacesDetailTasks' },
  children: [
    {
      path: 'announcements',
      name: 'SpacesAnnouncements',
      component: () => import('@/views/spaces/detail/Announcements.vue'),
    },
    {
      path: 'tasks',
      name: 'SpacesDetailTasks',
      component: () => import('@/layouts/spaces/SpacesTasks.vue'),
      redirect: { name: 'SpacesDetailTasksList' },
      meta: {
        title: '赛题',
        icon: { type: 'icon', value: 'mdi-cube-outline' },
      },
      children: [
        {
          path: '',
          name: 'SpacesDetailTasksList',
          components: {
            default: () => import('@/views/spaces/detail/Tasks.vue'),
            header: () => import('@/components/common/PageHeader.vue'),
          },
        },
        {
          path: 'publish',
          name: 'SpacesDetailPublishTask',
          components: {
            default: () => import('@/views/spaces/detail/PublishTask.vue'),
            header: () => import('@/components/common/PageHeader.vue'),
          },
          meta: {
            titleKey: 'tasks.publish.title',
          },
        },
        {
          path: ':taskId',
          name: 'SpacesDetailTasksDetail',
          components: {
            default: () => import('@/views/tasks/Detail.vue'),
            header: () => import('@/components/common/PageHeader.vue'),
          },
          meta: {
            title: '赛题',
          },
          children: [
            {
              path: '',
              name: 'TasksDetail',
              component: () => import('@/views/tasks/detail/Overview.vue'),
              meta: {
                title: '赛题概览',
                disableBreadcrumbLink: true,
              },
            },
            {
              path: 'submissions',
              name: 'TasksSubmissions',
              component: () => import('@/views/tasks/detail/Submissions.vue'),
              meta: {
                title: '提交记录',
                disableBreadcrumbLink: true,
              },
            },
            {
              path: 'participants',
              name: 'TasksParticipants',
              component: () => import('@/views/tasks/detail/Participants.vue'),
              meta: {
                title: '参与者管理',
                disableBreadcrumbLink: true,
              },
            },
            {
              path: 'submit',
              name: 'TasksSubmit',
              component: () => import('@/views/tasks/detail/Submit.vue'),
              meta: {
                title: '提交',
                disableBreadcrumbLink: true,
              },
            },
            {
              path: 'ai-advice',
              name: 'TasksAIAdvice',
              component: () => import('@/views/tasks/detail/AIAdvice.vue'),
              meta: {
                title: '启星研导',
                disableBreadcrumbLink: true,
              },
            },
          ],
        },
        {
          path: ':taskId/edit',
          name: 'TasksEdit',
          component: () => import('@/views/tasks/Edit.vue'),
          meta: {
            title: '编辑赛题',
          },
        },
      ],
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
      path: 'analytics/tasks',
      name: 'SpacesDetailAnalyticsTasks',
      component: () => import('@/views/spaces/detail/AnalyticsTasks.vue'),
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
    {
      path: 'discussions',
      name: 'SpacesDetailDiscussions',
      component: () => import('@/views/spaces/detail/Discussions.vue'),
      meta: {
        titleKey: 'spaces.discussions.title',
      },
    },
    {
      path: 'discussions/create',
      name: 'SpacesDetailCreateDiscussion',
      component: () => import('@/views/spaces/detail/CreateDiscussion.vue'),
      meta: {
        titleKey: 'spaces.discussions.createDiscussion',
      },
    },
    {
      path: 'discussions/:discussionId',
      name: 'SpacesDetailDiscussionItem',
      component: () => import('@/views/spaces/detail/DiscussionItem.vue'),
      meta: {
        titleKey: 'spaces.discussions.detailTitle',
      },
    },
  ],
} as RouteRecordRaw
