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
      component: () => import('@/views/group/GroupList.vue'),
    },
    {
      path: ':groupId', // 定义动态路由参数 groupId
      name: 'GroupID',
      component: () => import('@/layouts/group/GroupId.vue'),
      // components:  () => import('@/views/group/Base.vue'),
      children: [
        {
          path: '',
          name: 'GroupDetail',
          component: () => import('@/views/group/Base.vue'),
          children: [
            {
              path: '',
              name: 'GroupQuestion',
              component: () => import('@/views/group/Question.vue'), // 对应的视图组件
            },
            {
              path: 'targets',
              name: 'GroupTarget',
              component: () => import('@/views/group/Target.vue'),
            },
            {
              path: 'member',
              name: 'GroupMember',
              component: () => import('@/views/group/Member.vue'),
            },
          ],
        },
        {
          path: 'edit',
          name: 'GroupEdit',
          component: () => import('@/views/group/Edit.vue'),
        },
        {
          path: 'targets/:targetId',
          name: 'GroupTargetBase',
          component: () => import('@/views/group/target/TargetBase.vue'),
        },
      ],
    },
    {
      path: 'create',
      name: 'GroupCreate',
      component: () => import('@/views/group/Create.vue'),
    },
  ],
}
