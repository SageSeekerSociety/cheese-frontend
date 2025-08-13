<template>
  <div class="chat-message" :class="messageClass">
    <div class="message-wrapper">
      <!-- 头像 -->
      <v-avatar :size="40" class="message-avatar">
        <v-icon v-if="message.role === 'assistant'" icon="mdi-robot" color="primary"></v-icon>
        <v-icon v-else icon="mdi-account" color="grey-darken-1"></v-icon>
      </v-avatar>

      <!-- 消息内容 -->
      <div class="message-content">
        <!-- 消息气泡 -->
        <div class="message-bubble" :class="bubbleClass">
          <!-- 正在输入状态 -->
          <div v-if="message.isTyping" class="typing-animation">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <!-- 消息文本 -->
          <div v-else class="message-text">
            <div v-if="isMarkdown" v-html="renderedContent"></div>
            <div v-else>{{ message.content }}</div>
          </div>
        </div>

        <!-- 消息操作 -->
        <div v-if="!message.isTyping && message.role === 'assistant'" class="message-actions">
          <v-btn size="small" variant="text" @click="copyMessage">
            <v-icon>mdi-content-copy</v-icon>
            <v-tooltip activator="parent" location="top">复制</v-tooltip>
          </v-btn>
          <v-btn size="small" variant="text" @click="likeMessage">
            <v-icon>mdi-thumb-up-outline</v-icon>
            <v-tooltip activator="parent" location="top">有帮助</v-tooltip>
          </v-btn>
          <v-btn size="small" variant="text" @click="dislikeMessage">
            <v-icon>mdi-thumb-down-outline</v-icon>
            <v-tooltip activator="parent" location="top">没帮助</v-tooltip>
          </v-btn>
          <v-btn size="small" variant="text" @click="regenerateMessage">
            <v-icon>mdi-refresh</v-icon>
            <v-tooltip activator="parent" location="top">重新生成</v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface Props {
  message: Message
}

const props = defineProps<Props>()

// 计算样式类
const messageClass = computed(() => ({
  'message-user': props.message.role === 'user',
  'message-assistant': props.message.role === 'assistant',
}))

const bubbleClass = computed(() => ({
  'bubble-user': props.message.role === 'user',
  'bubble-assistant': props.message.role === 'assistant',
  'bubble-typing': props.message.isTyping,
}))

// 判断是否需要Markdown渲染
const isMarkdown = computed(() => {
  const content = props.message.content
  return /[*_`#[]()]/.test(content) || content.includes('```')
})

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!isMarkdown.value) return props.message.content

  try {
    return marked(props.message.content, {
      breaks: true,
      gfm: true,
    })
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return props.message.content
  }
})

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 复制消息
const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    // TODO: 显示复制成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 点赞消息
const likeMessage = () => {
  // TODO: 实现点赞逻辑
  console.log('点赞消息:', props.message.id)
}

// 踩消息
const dislikeMessage = () => {
  // TODO: 实现踩逻辑
  console.log('踩消息:', props.message.id)
}

// 重新生成消息
const regenerateMessage = () => {
  // TODO: 实现重新生成逻辑
  console.log('重新生成消息:', props.message.id)
}
</script>

<style scoped>
.chat-message {
  display: flex;
  margin-bottom: 1rem;
}

.message-user {
  justify-content: flex-end;
}

.message-assistant {
  justify-content: flex-start;
}

.message-wrapper {
  display: flex;
  max-width: 80%;
  align-items: flex-start;
}

.message-user .message-wrapper {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 0.5rem;
}

.message-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  word-wrap: break-word;
  position: relative;
}

.bubble-user {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  margin-left: 2rem;
}

.bubble-assistant {
  background-color: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  margin-right: 2rem;
}

.bubble-typing {
  background-color: rgb(var(--v-theme-surface-variant));
  padding: 1rem 1.25rem;
}

.message-text {
  line-height: 1.5;
}

.message-text :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.message-text :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.message-actions {
  display: flex;
  gap: 0.125rem;
  margin-top: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

/* 正在输入动画 */
.typing-animation {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.typing-animation span {
  width: 0.5rem;
  height: 0.5rem;
  background-color: rgb(var(--v-theme-on-surface-variant));
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-animation span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-animation span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-0.5rem);
    opacity: 1;
  }
}
</style>
