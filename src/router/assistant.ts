import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/assistant',
  name: 'Assistant',
  component: () => import('@/layouts/assistant/Assistant.vue'),
  meta: {
    title: 'AI助手',
  },
  children: [
    {
      path: '',
      name: 'AssistantDefault',
      component: () => import('@/views/assistant/Index.vue'),
    },
    {
      path: 'conversations/:conversationId',
      name: 'AssistantConversation',
      component: () => import('@/views/assistant/Conversation.vue'),
      props: true,
    },
    {
      path: 'memory',
      name: 'AssistantMemory',
      component: () => import('@/views/assistant/Memory.vue'),
    },
    {
      path: 'knowledge-graph',
      name: 'AssistantKnowledgeGraph',
      component: () => import('@/views/assistant/KnowledgeGraph.vue'),
    },
  ],
} as RouteRecordRaw
