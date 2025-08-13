<template>
  <div class="conversation-view">
    <div v-if="loading" class="d-flex justify-center align-center h-100">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="error" class="d-flex justify-center align-center h-100">
      <v-alert type="error" title="加载失败" :text="error"></v-alert>
    </div>

    <div v-else class="conversation-content">
      <!-- 对话内容区域 -->
      <div class="messages-area">
        <ChatMessage v-for="message in messages" :key="message.id" :message="message" class="mb-4" />
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <ChatInput v-model="inputMessage" :loading="isSending" @send="handleSendMessage" @stop="handleStopGeneration" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import ChatInput from '@/components/assistant/ChatInput.vue'
import ChatMessage from '@/components/assistant/ChatMessage.vue'

interface Props {
  conversationId: string
}

const props = defineProps<Props>()

// 数据
const loading = ref(true)
const error = ref('')
const messages = ref<
  Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
>([])
const inputMessage = ref('')
const isSending = ref(false)

// 生命周期
onMounted(async () => {
  await loadConversation()
})

// 加载对话
const loadConversation = async () => {
  try {
    loading.value = true
    // TODO: 从API加载对话数据
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟加载

    // 模拟消息数据
    messages.value = [
      {
        id: '1',
        role: 'user',
        content: '你好，请介绍一下你的功能',
        timestamp: new Date('2024-01-15T10:30:00'),
      },
      {
        id: '2',
        role: 'assistant',
        content:
          '您好！我是AI助手，具有以下主要功能：\n\n1. **智能对话** - 可以回答各种问题，提供建议和指导\n2. **知识管理** - 帮助您整理和管理知识点\n3. **学习辅导** - 制定学习计划，解答学习疑问\n4. **项目协助** - 分析项目进度，提供优化建议\n\n我会记住我们的对话内容，为您提供个性化的服务。有什么我可以帮助您的吗？',
        timestamp: new Date('2024-01-15T10:30:30'),
      },
    ]
  } catch (err) {
    error.value = '加载对话失败，请稍后重试'
    console.error('加载对话失败:', err)
  } finally {
    loading.value = false
  }
}

// 发送消息
const handleSendMessage = async (message: string) => {
  if (!message.trim() || isSending.value) return

  // 添加用户消息
  const userMessage = {
    id: Date.now().toString(),
    role: 'user' as const,
    content: message,
    timestamp: new Date(),
  }
  messages.value.push(userMessage)

  isSending.value = true

  try {
    // TODO: 调用AI助手API
    await simulateAIResponse()
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    isSending.value = false
  }
}

// 停止生成
const handleStopGeneration = () => {
  isSending.value = false
}

// 模拟AI响应
const simulateAIResponse = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const aiMessage = {
    id: Date.now().toString(),
    role: 'assistant' as const,
    content: '感谢您的问题！我正在思考如何为您提供最好的帮助...',
    timestamp: new Date(),
  }
  messages.value.push(aiMessage)
}
</script>

<style scoped>
.conversation-view {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.conversation-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.input-area {
  padding: 1rem;
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
