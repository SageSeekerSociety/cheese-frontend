<template>
  <v-list density="compact" max-height="300px" class="overflow-y-auto" nav rounded="lg">
    <slot name="prepend"></slot>

    <template v-for="(group, index) in groupedConversations" :key="index">
      <!-- 时间分组标题 -->
      <v-list-subheader>{{ group.title }}</v-list-subheader>

      <v-list-item
        v-for="conversation in group.conversations"
        :key="conversation.conversationId"
        color="primary"
        rounded="lg"
        :active="conversation.conversationId === activeConversationId"
        @click="$emit('select', conversation.conversationId)"
      >
        <v-list-item-title>{{ formatConversationTitle(conversation) }}</v-list-item-title>
        <v-list-item-subtitle class="text-caption">{{
          new Date(conversation.updatedAt).toLocaleString()
        }}</v-list-item-subtitle>

        <template #append>
          <slot name="item-append" :conversation="conversation"></slot>
        </template>
      </v-list-item>
    </template>
  </v-list>
</template>

<script setup lang="ts">
import type { ConversationSummary } from './types'

import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  conversations: ConversationSummary[]
  activeConversationId: string
  searchQuery?: string
}>()

const emit = defineEmits<{
  select: [conversationId: string]
}>()

// 根据搜索筛选对话
const filteredConversations = computed(() => {
  if (!props.searchQuery?.trim()) {
    return props.conversations
  }
  const query = props.searchQuery.toLowerCase()
  return props.conversations.filter(
    (conversation) =>
      conversation.latestMessage?.question?.toLowerCase().includes(query) ||
      conversation.latestMessage?.response?.toLowerCase().includes(query) ||
      conversation.title?.toLowerCase().includes(query)
  )
})

// 将对话按时间分组
const groupedConversations = computed(() => {
  const now = dayjs()
  const today = now.startOf('day')
  const yesterday = today.subtract(1, 'day')
  const lastWeek = today.subtract(7, 'day')
  const lastMonth = today.subtract(30, 'day')

  // 创建分组
  const groups = [
    { title: '今天', conversations: [] as ConversationSummary[] },
    { title: '昨天', conversations: [] as ConversationSummary[] },
    { title: '过去7天', conversations: [] as ConversationSummary[] },
    { title: '过去30天', conversations: [] as ConversationSummary[] },
    { title: '更早', conversations: [] as ConversationSummary[] },
  ]

  // 对对话进行分组
  filteredConversations.value.forEach((conversation) => {
    const date = conversation.updatedAt ? dayjs(conversation.updatedAt) : null

    if (!date) {
      groups[0].conversations.push(conversation) // 如果没有日期，默认放在今天
      return
    }

    if (date.isAfter(today) || date.isSame(today, 'day')) {
      groups[0].conversations.push(conversation)
    } else if (date.isAfter(yesterday) || date.isSame(yesterday, 'day')) {
      groups[1].conversations.push(conversation)
    } else if (date.isAfter(lastWeek)) {
      groups[2].conversations.push(conversation)
    } else if (date.isAfter(lastMonth)) {
      groups[3].conversations.push(conversation)
    } else {
      groups[4].conversations.push(conversation)
    }
  })

  // 只返回有对话的分组
  return groups.filter((group) => group.conversations.length > 0)
})

// 截断文本函数
const truncateText = (text?: string | null, maxLength: number = 60) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 格式化对话标题
const formatConversationTitle = (conversation: ConversationSummary) => {
  if (conversation.title) return conversation.title
  if (!conversation.latestMessage?.question) return '新对话'
  return truncateText(conversation.latestMessage?.question, 30)
}
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}
</style>
