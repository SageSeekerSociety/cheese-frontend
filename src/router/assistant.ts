import type { RouteRecordRaw } from 'vue-router'

import RouterPassThrough from '@/layouts/RouterPassThrough.vue'

export default {
  path: '/assistant',
  name: 'Assistant',
  components: {
    default: RouterPassThrough,
    sidebar: () => import('@/components/assistant/GlobalAssistantSidebar.vue'),
  },
  meta: {
    title: '元思',
    isFullPage: true,
  },
  children: [
    {
      path: '',
      name: 'AssistantIndex',
      components: {
        default: () => import('@/views/assistant/Index.vue'),
      },
    },
    {
      path: 'conversations/:conversationId',
      name: 'AssistantConversation',
      components: {
        default: () => import('@/views/assistant/Conversation.vue'),
      },
    },
    {
      path: 'memory',
      name: 'AssistantMemory',
      components: {
        default: () => import('@/views/assistant/Memory.vue'),
      },
    },
    {
      path: 'knowledge-graph',
      name: 'AssistantKnowledgeGraph',
      components: {
        default: () => import('@/views/assistant/KnowledgeGraph.vue'),
      },
    },
  ],
} as RouteRecordRaw
