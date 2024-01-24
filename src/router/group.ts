export default {
  path: '/group',
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
          name: 'GroupDetailDefault',
          component: () => import('@/views/group/Question.vue'), // 对应的视图组件
        },
        // {
        //   path: "question", // 定义动态路由参数 groupId
        //   name: "Question",
        //   component: () => import("@/views/group/Question.vue"), // 对应的视图组件
        // },
        {
          path: 'target', // 定义动态路由参数 groupId
          name: 'GroupTarget',
          component: () => import('@/views/group/Target.vue'), // 对应的视图组件
        },
      ],
    },
  ],
}
