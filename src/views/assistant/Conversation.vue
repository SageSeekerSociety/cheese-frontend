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
import type { MetisMessageResponse, TextContent, ToolCallContent, ToolResultContent } from '@/network/api/metis'

import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import ChatInput from '@/components/assistant/ChatInput.vue'
import ChatMessage from '@/components/assistant/ChatMessage.vue'
import { MetisApi } from '@/network/api/metis'

interface Props {
  conversationId: string
}

const props = defineProps<Props>()
const route = useRoute()
const activeConversationId = computed(() =>
  (props.conversationId || (route.params.conversationId as string) || '').toString()
)

// 数据
const loading = ref(true)
const error = ref('')
type Role = 'user' | 'assistant' | 'tool'
type MessageType = 'TEXT' | 'TOOL_CALL' | 'TOOL_RESULT'
const messages = ref<
  Array<{
    id: string
    role: Role
    messageType: MessageType
    content: string
    timestamp: Date
    isTyping?: boolean
    toolName?: string
    toolInput?: Record<string, any>
    toolResult?: string
  }>
>([])
const inputMessage = ref('')
const isSending = ref(false)
let stoppedManually = false
let currentAbortController: AbortController | null = null

// 生命周期
onMounted(async () => {
  await loadConversation()
})

watch(
  () => activeConversationId.value,
  async () => {
    await loadConversation()
  }
)

// 提取消息内容
const extractMessageContent = (msg: MetisMessageResponse): string => {
  switch (msg.message_type) {
    case 'TEXT':
      return (msg.content as TextContent).text
    case 'TOOL_CALL':
      return `[工具调用] ${(msg.content as ToolCallContent).tool_name}`
    case 'TOOL_RESULT': {
      const r = msg.content as ToolResultContent
      return `[工具结果] ${r.tool_name}: ${r.result.substring(0, 100)}...`
    }
    default:
      return typeof msg.content === 'string' ? (msg.content as string) : ''
  }
}

// 扁平化消息树
const flattenMessageTree = (list: MetisMessageResponse[]): MetisMessageResponse[] => {
  const result: MetisMessageResponse[] = []
  const walk = (nodes: MetisMessageResponse[]) => {
    for (const n of nodes) {
      result.push(n)
      if (n.children && n.children.length) walk(n.children)
    }
  }
  walk(list)
  return result
}

// 加载对话
const loadConversation = async () => {
  if (!activeConversationId.value) return
  try {
    loading.value = true
    error.value = ''
    const { data } = await MetisApi.getConversationTree(activeConversationId.value)
    const flat = flattenMessageTree(data.messages)
    flat.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    messages.value = flat.map((m) => {
      const base = {
        id: m.message_id,
        role: m.role as Role,
        messageType: m.message_type as MessageType,
        content: extractMessageContent(m),
        timestamp: new Date(m.created_at),
      }
      if (m.message_type === 'TOOL_CALL') {
        const tc = m.content as ToolCallContent
        return { ...base, toolName: tc.tool_name, toolInput: tc.tool_input }
      }
      if (m.message_type === 'TOOL_RESULT') {
        const tr = m.content as ToolResultContent
        return { ...base, toolName: tr.tool_name, toolResult: tr.result }
      }
      return base
    })
    await nextTick()
    scrollToBottom()
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

  // 计算父消息ID（以服务器返回的最后一条消息为准）
  const lastServerMsg = [...messages.value].reverse().find((m) => !(m.id.startsWith('u_') || m.id.startsWith('a_')))
  const parentMessageId = lastServerMsg?.id ?? null

  // 添加用户消息（本地回显）
  const userMessage = {
    id: `u_${Date.now()}`,
    role: 'user' as Role,
    messageType: 'TEXT' as MessageType,
    content: message,
    timestamp: new Date(),
  }
  messages.value.push(userMessage)

  // 创建AI响应占位符
  const aiMessage = {
    id: `a_${Date.now() + 1}`,
    role: 'assistant' as Role,
    messageType: 'TEXT' as MessageType,
    content: '',
    timestamp: new Date(),
    isTyping: true,
  }
  messages.value.push(aiMessage)

  isSending.value = true
  stoppedManually = false
  currentAbortController = new AbortController()

  try {
    const stream = MetisApi.streamMessage(
      activeConversationId.value,
      { content: message, parent_message_id: parentMessageId ?? undefined, stream: true },
      currentAbortController.signal
    )
    let fullContent = ''
    for await (const event of stream) {
      if (stoppedManually) break
      if (event.type === 'delta') {
        fullContent += event.data.content
        const idx = messages.value.findIndex((m) => m.id === aiMessage.id)
        if (idx !== -1) messages.value[idx].content = fullContent
        await nextTick()
        scrollToBottom()
      } else if (event.type === 'end') {
        const idx = messages.value.findIndex((m) => m.id === aiMessage.id)
        if (idx !== -1) {
          messages.value[idx].content = fullContent
          messages.value[idx].isTyping = false
        }
        break
      } else if (event.type === 'error') {
        const idx = messages.value.findIndex((m) => m.id === aiMessage.id)
        if (idx !== -1) {
          messages.value[idx].content = '抱歉，处理您的请求时出现了错误：' + event.data.message
          messages.value[idx].isTyping = false
        }
        break
      } else if (event.type === 'tool_call') {
        // 可选：显示工具调用提示
        const idx = messages.value.findIndex((m) => m.id === aiMessage.id)
        if (idx !== -1) {
          messages.value[idx].content = `${fullContent}\n\n[正在调用工具: ${event.data.tool_name}]`
        }
      } else if (event.type === 'tool_result') {
        // 可选：显示工具结果提示
        const idx = messages.value.findIndex((m) => m.id === aiMessage.id)
        if (idx !== -1) {
          messages.value[idx].content = `${fullContent}\n\n[工具完成: ${event.data.tool_name}]`
        }
      }
    }
  } catch (err) {
    console.error('发送消息失败:', err)
    const idx = messages.value.findIndex((m) => m.id === aiMessage.id)
    if (idx !== -1) {
      messages.value[idx].content = '抱歉，发送消息时出现了错误。请稍后重试。'
      messages.value[idx].isTyping = false
    }
  } finally {
    isSending.value = false
    currentAbortController = null
  }
}

// 停止生成
const handleStopGeneration = () => {
  stoppedManually = true
  isSending.value = false
  if (currentAbortController) {
    try {
      currentAbortController.abort()
    } catch (_) {
      // Ignore abort errors
    }
    currentAbortController = null
  }
}

// 滚动到底部
const scrollToBottom = () => {
  const container = document.querySelector('.messages-area')
  if (container) container.scrollTop = container.scrollHeight
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
