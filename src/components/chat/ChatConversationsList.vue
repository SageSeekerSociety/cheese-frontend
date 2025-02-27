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
        text="开始新对话"
        @click="$emit('newConversation')"
      ></v-btn>
    </div>
    <div class="conversation-list px-2">
      <v-list lines="one" density="compact" select-strategy="single-independent" :selected="[activeConversationId]">
        <template v-for="(group, index) in groupedConversations" :key="index">
          <!-- 时间分组标题 -->
          <v-list-subheader>{{ group.title }}</v-list-subheader>

          <v-list-item
            v-for="conversation in group.conversations"
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
              <v-btn
                icon
                variant="plain"
                density="compact"
                class="delete-btn"
                @click.stop="deleteConversation(conversation.conversationId)"
              >
                <v-icon size="small">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </template>
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
  select: [conversationId: string]
  newConversation: []
  delete: [conversationId: string]
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
    const date = conversation.latestMessage?.createdAt ? dayjs(conversation.latestMessage.createdAt) : null

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

// 格式化时间
const formatTime = (dateStr: string) => {
  try {
    return dayjs(dateStr).fromNow()
  } catch (e) {
    return '未知时间'
  }
}

const deleteConversation = (conversationId: string) => {
  console.log('deleteConversation', conversationId)
  emit('delete', conversationId)
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

/* 删除按钮样式 */
.delete-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  position: absolute;
  right: 4px;
}

/* 鼠标悬浮时显示删除按钮 */
.conversation-list-item:hover .delete-btn {
  opacity: 1;
}
</style>
