export default {
  path: '/user',
  name: 'User',
  component: () => import('@/layouts/user/User.vue'),
  children: [
    {
      path: '',
      name: 'UserDefault', // ParentName->ParentNameDefault 这个关键字敏感
      component: () => import('@/views/user/Question.vue'),
    },
    {
      path: 'question',
      name: 'UserQuestion',
      component: () => import('@/views/user/Question.vue'),
    },
    {
      path: 'answer',
      name: 'UserAnswer',
      component: () => import('@/views/user/Answer.vue'),
    },
  ],
}
