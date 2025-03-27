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
          component: () => import('@/views/teams/detail/Projects.vue'),
        },
        {
          path: 'channels/:channelId',
          name: 'TeamsDetailChannels',
          component: () => import('@/views/teams/detail/Projects.vue'),
        },
        {
          path: 'discussions/:discussionId',
          name: 'TeamsDetailDiscussion',
          components: {
            default: () => import('@/views/teams/detail/DiscussionDetail.vue'),
            header: () => import('@/views/teams/detail/DiscussionHeader.vue'),
          },
          meta: {
            isDiscussionDetail: true,
          },
          props: {
            default: true,
            header: true,
          },
        },
        {
          path: 'members',
          name: 'TeamsDetailMembers',
          component: () => import('@/views/teams/detail/Members.vue'),
        },
        {
          path: 'knowledge',
          name: 'TeamsDetailKnowledge',
          component: () => import('@/views/teams/detail/Knowledge.vue'),
        },
      ],
    },
  ],
} as RouteRecordRaw
