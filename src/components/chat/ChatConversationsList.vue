<template>
  <div class="conversation-list-container border-e">
    <div class="px-2">
      <v-text-field
        v-model="searchQuery"
        density="compact"
        flat
        hide-details
        placeholder="搜索对话..."
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        rounded="lg"
        single-line
        class="mb-4"
      ></v-text-field>

      <v-btn
        block
        variant="tonal"
        color="primary"
        prepend-icon="mdi-plus-circle"
        class="text-start"
        @click="$emit('new-conversation')"
      >
        开始新对话
      </v-btn>
    </div>
    <div class="conversation-list px-2">
      <v-list lines="one" density="compact" select-strategy="single-independent" :selected="[activeConversationId]">
        <v-list-item
          v-for="conversation in filteredConversations"
          :key="conversation.conversationId"
          :value="conversation.conversationId"
          :active="conversation.conversationId === activeConversationId"
          class="conversation-list-item"
          rounded="lg"
          @click="selectConversation(conversation.conversationId)"
        >
          <v-list-item-title class="text-truncate">
            {{ formatConversationTitle(conversation) }}
          </v-list-item-title>
          <template #append>
            <div class="text-caption text-medium-emphasis">
              {{ formatTime(conversation.updatedAt) }}
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConversationSummary } from './types'

import { computed, ref } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  conversations: ConversationSummary[]
  activeConversationId: string
}>()

const emit = defineEmits<{
  (e: 'select', conversationId: string): void
  (e: 'new-conversation'): void
}>()

const searchQuery = ref('')

// 根据搜索筛选对话
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.conversations
  }
  const query = searchQuery.value.toLowerCase()
  return props.conversations.filter(
    (conversation) =>
      conversation.latestMessage?.question?.toLowerCase().includes(query) ||
      conversation.latestMessage?.response?.toLowerCase().includes(query)
  )
})

// 格式化时间
const formatTime = (dateStr: string) => {
  try {
    return dayjs(dateStr).fromNow()
  } catch (e) {
    return '未知时间'
  }
}

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

// 选择对话
const selectConversation = (conversationId: string) => {
  emit('select', conversationId)
}
</script>

<style scoped>
.conversation-list-container {
  width: 250px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
}

.conversation-list {
  flex-grow: 1;
  overflow-y: auto;
}

.conversation-list::-webkit-scrollbar {
  width: 4px;
}

.conversation-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.conversation-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}
</style>
