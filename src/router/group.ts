import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/groups',
  name: 'Group',
  component: () => import('@/layouts/group/Group.vue'),
  meta: {
    title: '圈子',
  },
  children: [
    {
      path: '',
      name: 'GroupDefault',
      component: () => import('@/views/group/Default.vue'),
    },
    {
      path: ':groupId', // 定义动态路由参数 groupId
      name: 'GroupDetail',
      component: () => import('@/views/group/Base.vue'), // 对应的视图组件
      children: [
        {
          path: '',
          name: 'GroupQuestion',
          component: () => import('@/views/group/Question.vue'), // 对应的视图组件
        },
        {
          path: 'target',
          name: 'GroupTarget',
          component: () => import('@/views/group/Target.vue'),
        },
        {
          path: 'member',
          name: 'GroupMember',
          component: () => import('@/views/group/Member.vue'),
        },
        {
          path: 'manage',
          name: 'GroupManage',
          component: () => import('@/views/group/Manage.vue'),
        },
      ],
    },
    {
      path: 'create',
      name: 'GroupCreate',
      component: () => import('@/views/group/Create.vue'),
    },
  ],
} as RouteRecordRaw
