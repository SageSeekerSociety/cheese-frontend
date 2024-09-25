import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/users/:id',
  name: 'User',
  component: () => import('@/layouts/user/User.vue'),
  children: [
    {
      path: '',
      name: 'UserDefault',
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
  beforeEnter: (to, from, next) => {
    if (to.name === 'UserDefault' || to.name === 'UserQuestion' || to.name === 'UserAnswer' || to.name === 'User') {
      next({ name: 'UserFollowing', params: to.params })
    } else {
      next()
    }
  },
} as RouteRecordRaw
