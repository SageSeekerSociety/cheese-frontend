export default {
  path: '/user/:id',
  name: 'User',
  component: () => import('@/layouts/user/User.vue'),
  children: [
    {
      path: '',
      name: 'UserQuestion',
      component: () => import('@/views/user/Question.vue'),
    },
    // {
    //   path: 'question',
    //   name: 'UserQuestion',
    //   component: () => import('@/views/user/Question.vue'),
    // },
    {
      path: 'answer',
      name: 'UserAnswer',
      component: () => import('@/views/user/Answer.vue'),
    },
    {
      path: 'following',
      name: 'UserFollowing',
      component: () => import('@/views/user/Following.vue'),
    },
    {
      path: 'follower',
      name: 'UserFollower',
      component: () => import('@/views/user/Follower.vue'),
    },
  ],
}
