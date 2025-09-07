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
          <!-- 消息文本 -->
          <div class="message-text">
            <div v-html="renderedContent"></div>

            <!-- 正在输入状态 - 显示在内容后面 -->
            <span v-if="message.isTyping" class="typing-cursor">▊</span>
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
// 引入 Prism 语法高亮样式
import 'prismjs/themes/prism.css'

import { computed } from 'vue'

import { MarkdownRenderer } from '@/components/chat/services/markdownRenderer'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool'
  messageType: 'TEXT' | 'TOOL_CALL' | 'TOOL_RESULT'
  content: string
  timestamp: Date
  isTyping?: boolean
  toolName?: string
  toolInput?: Record<string, any>
  toolResult?: string
}

interface Props {
  message: Message
}

const props = defineProps<Props>()

// 创建 Markdown 渲染器实例
const markdownRenderer = new MarkdownRenderer()

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

// 渲染Markdown内容
const renderedContent = computed(() => {
  return markdownRenderer.render(props.message.content)
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
  position: relative;
}

.message-text :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.message-text :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.message-text :deep(p) {
  line-height: 1.5;
  margin-bottom: 12px;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  padding-left: 24px;
  margin-bottom: 12px;
}

.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3),
.message-text :deep(h4),
.message-text :deep(h5),
.message-text :deep(h6) {
  margin-top: 16px;
  margin-bottom: 12px;
  font-weight: 600;
  line-height: 1.3;
}

.message-text :deep(blockquote) {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.4);
  padding: 0 0 0 16px;
  margin: 12px 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-style: italic;
}

.message-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 0.9em;
}

.message-text :deep(th),
.message-text :deep(td) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 8px;
  text-align: left;
}

.message-text :deep(th) {
  background-color: rgba(var(--v-theme-primary), 0.05);
  font-weight: 600;
}

.message-text :deep(tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.015);
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

/* 输入光标样式 */
.typing-cursor {
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
  animation: blink 1s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
</style>
