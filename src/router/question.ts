export default {
  path: '/questions',
  name: 'Question',
  component: () => import('@/layouts/question/Question.vue'),
  meta: {
    title: '问答',
  },
  children: [
    {
      path: 'ask',
      name: 'QuestionAsk',
      component: () => import('@/views/question/Ask.vue'),
      meta: {
        title: '提问',
      },
    },
    {
      path: ':questionId(\\d+)',
      name: 'QuestionDetail',
      component: () => import('@/views/question/Detail.vue'),
      meta: {
        title: '问题详情',
      },
      children: [
        {
          path: '',
          name: 'QuestionAnswerList',
          component: () => import('@/views/question/DetailAnswerList.vue'),
        },
        {
          path: 'answers/:answerId(\\d+)',
          name: 'QuestionAnswer',
          component: () => import('@/views/question/DetailAnswer.vue'),
        },
      ],
    },
  ],
}
