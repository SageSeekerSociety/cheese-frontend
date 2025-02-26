<template>
  <div>
    <!-- 用户消息 -->
    <div class="d-flex justify-end align-center mb-3 user-message-container">
      <!-- 编辑模式 -->
      <template v-if="isEditMode">
        <v-card max-width="80%" color="primary" class="user-message edit-mode-card">
          <v-card-text class="pa-3">
            <v-textarea
              ref="editTextarea"
              v-model="editedQuestion"
              auto-grow
              rows="2"
              variant="plain"
              hide-details
              density="compact"
              color="white"
              bg-color="transparent"
              placeholder="编辑您的问题..."
            ></v-textarea>
            <div class="d-flex justify-end gap-2 mt-2">
              <v-btn size="small" variant="text" color="white" @click="cancelEdit">取消</v-btn>
              <v-btn size="small" variant="tonal" color="white" @click="submitEdit">提交</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </template>

      <!-- 正常显示模式 -->
      <template v-else>
        <div class="message-actions me-2">
          <v-btn
            density="comfortable"
            variant="text"
            size="small"
            icon
            color="primary"
            class="message-action-button"
            @click="startEdit"
          >
            <v-icon>mdi-pencil</v-icon>
            <v-tooltip activator="parent">编辑消息</v-tooltip>
          </v-btn>
        </div>
        <v-card max-width="80%" color="primary" class="user-message">
          <v-card-text class="pa-3 text-white">
            {{ message.question }}
          </v-card-text>
        </v-card>
      </template>
    </div>

    <!-- 分支切换器（在用户消息时显示，条件：是分支点的子消息或者是顶级分支点） -->
    <div
      v-if="isBranchPoint || (isLastMessage && !message.parentId && branchCount > 1)"
      class="d-flex justify-end mb-3"
    >
      <v-btn-group variant="plain" density="comfortable" size="small" class="branch-switcher">
        <v-btn icon size="small" @click="switchToPreviousBranch">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn disabled variant="text" size="small" class="branch-counter">
          {{ currentBranchIndex }}/{{ branchCount }}
        </v-btn>
        <v-btn icon size="small" @click="switchToNextBranch">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-btn-group>
    </div>

    <!-- AI回答 -->
    <div class="d-flex justify-start mb-3">
      <v-card max-width="100%" color="surface" class="ai-message">
        <!-- 推理部分 -->
        <template v-if="showReasoning">
          <v-card-text class="px-3 pt-3 pb-0">
            <div
              class="d-flex align-center justify-space-between reasoning-header mb-2 cursor-pointer"
              @click="toggleReasoningExpanded"
            >
              <div class="d-flex align-center">
                <v-icon size="small" color="info" class="me-1">mdi-brain</v-icon>
                <span class="text-body-2 font-weight-medium text-info">
                  {{ reasoningStatusText }}
                </span>
              </div>
              <v-icon v-if="reasoningStatus !== 'reasoning' || !isStreaming" size="small" color="info">
                {{ reasoningExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </div>
            <v-expand-transition>
              <div
                v-if="reasoningExpanded || reasoningStatus === 'reasoning'"
                class="text-caption text-medium-emphasis"
              >
                <div class="reasoning-text" v-html="reasoningContentHtml"></div>
              </div>
            </v-expand-transition>
          </v-card-text>
        </template>

        <!-- AI回答内容 -->
        <v-card-text class="pa-3">
          <div v-if="isStreaming">
            <div v-html="responseHtml"></div>
          </div>
          <div v-else v-html="responseHtml"></div>
        </v-card-text>
      </v-card>
    </div>

    <!-- 后续问题 -->
    <div v-if="showFollowupQuestions" class="d-flex justify-start followup-questions-container">
      <div class="d-flex flex-wrap gap-1">
        <v-chip
          v-for="(q, i) in message.followupQuestions"
          :key="i"
          size="small"
          variant="tonal"
          density="comfortable"
          class="followup-chip"
          @click="followupClicked(q)"
        >
          {{ q }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, ChatMessageNode } from './types'

import { computed, nextTick, ref, watch } from 'vue'

import { MarkdownRenderer } from './services/markdownRenderer'
import { ReasoningStatus } from './types'

const props = withDefaults(
  defineProps<{
    message: ChatMessage
    isStreaming?: boolean
    streamingResponse?: string
    streamingReasoningContent?: string
    reasoningStatus?: ReasoningStatus
    streamingReasoningTimeMs?: number | null
    isLastMessage?: boolean
    isBranchPoint?: boolean
    parentBranchChildren?: ChatMessageNode[]
    currentBranchIndex?: number
    branchCount?: number
  }>(),
  {
    isStreaming: false,
    streamingResponse: '',
    streamingReasoningContent: '',
    reasoningStatus: ReasoningStatus.NONE,
    streamingReasoningTimeMs: null,
    isLastMessage: false,
    isBranchPoint: false,
    parentBranchChildren: () => [],
    currentBranchIndex: 1,
    branchCount: 0,
  }
)

const emit = defineEmits<{
  (e: 'followupQuestion', question: string): void
  (e: 'branchFromMessage', messageId: number, question: string): void
  (e: 'switchBranch', parentId: number, direction: 'prev' | 'next'): void
}>()

// 初始化推理展开状态 - 默认为false (不显示)
const reasoningExpanded = ref(false)

// 创建Markdown渲染器实例
const markdownRenderer = new MarkdownRenderer()

// 编辑相关状态
const isEditMode = ref(false)
const editedQuestion = ref('')
const editTextarea = ref<HTMLElement | null>(null)

// 开始编辑
const startEdit = () => {
  editedQuestion.value = props.message.question
  isEditMode.value = true
  // 使用nextTick等待DOM更新后再聚焦
  nextTick(() => {
    if (editTextarea.value) {
      const textarea = editTextarea.value.querySelector('textarea')
      if (textarea) {
        textarea.focus()
      }
    }
  })
}

// 取消编辑
const cancelEdit = () => {
  isEditMode.value = false
  editedQuestion.value = ''
}

// 提交编辑，创建新分支
const submitEdit = () => {
  const question = editedQuestion.value.trim()
  if (question) {
    emit('branchFromMessage', props.message.id, question)
    isEditMode.value = false
    editedQuestion.value = ''
  }
}

// 格式化推理时间
const formatReasoningTime = (timeMs: number | null | undefined) => {
  if (timeMs === null || timeMs === undefined) return '思考过程'

  const seconds = Math.round(timeMs / 1000)
  if (seconds < 60) {
    return `已深度思考 ${seconds} 秒`
  } else {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `已深度思考 ${minutes} 分 ${remainingSeconds} 秒`
  }
}

// 推理状态文本
const reasoningStatusText = computed(() => {
  if (props.isStreaming) {
    if (props.reasoningStatus === 'reasoning') return '正在思考中...'
    if (props.reasoningStatus === 'completed') return formatReasoningTime(props.streamingReasoningTimeMs)
  }
  return formatReasoningTime(props.message.reasoningTimeMs)
})

// 监听推理状态变化，当推理完成时自动收起
watch(
  () => props.reasoningStatus,
  (newStatus, oldStatus) => {
    // 当推理状态从'reasoning'变为'completed'时，自动收起推理内容
    if (oldStatus === 'reasoning' && newStatus === 'completed') {
      reasoningExpanded.value = false
    }
    // 当推理开始时，自动展开
    if (newStatus === 'reasoning') {
      reasoningExpanded.value = true
    }
  }
)

// 是否显示推理内容
const showReasoning = computed(() => {
  return (
    (props.isStreaming && props.reasoningStatus !== 'none') ||
    (!props.isStreaming && props.message.modelType === 'reasoning' && props.message.reasoningContent)
  )
})

// 获取推理内容
const reasoningContentHtml = computed(() => {
  if (props.isStreaming && props.reasoningStatus === 'reasoning') {
    const html = renderMarkdown(props.streamingReasoningContent || '')
    return addCursorToHtml(html, true)
  }
  return renderMarkdown(props.message.reasoningContent || '')
})

// 获取回复内容
const responseHtml = computed(() => {
  if (props.isStreaming && props.reasoningStatus !== 'reasoning') {
    const html = renderMarkdown(props.streamingResponse || '')
    return props.isStreaming ? addCursorToHtml(html) : html
  }
  return renderMarkdown(props.message.response)
})

// 是否显示后续问题
const showFollowupQuestions = computed(() => {
  return props.message.followupQuestions?.length && !props.isStreaming && props.isLastMessage
})

// 渲染Markdown内容
const renderMarkdown = (text: string) => {
  if (!text) return ''
  return markdownRenderer.render(text)
}

// 切换推理展开状态
const toggleReasoningExpanded = () => {
  if (props.reasoningStatus === 'reasoning' && props.isStreaming) return
  reasoningExpanded.value = !reasoningExpanded.value
}

// 后续问题点击处理
const followupClicked = (question: string) => {
  emit('followupQuestion', question)
}

watch(
  () => props.message.id,
  () => {
    // 新消息时，默认不展开推理
    reasoningExpanded.value = false
  }
)

// 切换到上一个分支
const switchToPreviousBranch = () => {
  if (props.message.parentId) {
    emit('switchBranch', props.message.parentId, 'prev')
  } else if (props.branchCount > 1) {
    // 对于顶级分支，使用特殊的 parentId=0 表示根级切换
    emit('switchBranch', 0, 'prev')
  }
}

// 切换到下一个分支
const switchToNextBranch = () => {
  if (props.message.parentId) {
    emit('switchBranch', props.message.parentId, 'next')
  } else if (props.branchCount > 1) {
    // 对于顶级分支，使用特殊的 parentId=0 表示根级切换
    emit('switchBranch', 0, 'next')
  }
}

// 在HTML末尾添加光标
const addCursorToHtml = (html: string, isReasoning = false) => {
  if (!html) return '<span class="input-cursor' + (isReasoning ? ' reasoning-cursor' : '') + '"></span>'

  // 创建一个临时的DOM元素来解析HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // 找到最后一个元素
  const lastElement = findLastElement(tempDiv)

  // 如果找到了最后一个元素，添加光标
  if (lastElement) {
    lastElement.insertAdjacentHTML(
      'beforeend',
      '<span class="input-cursor' + (isReasoning ? ' reasoning-cursor' : '') + '"></span>'
    )
    return tempDiv.innerHTML
  }

  // 如果没有找到元素，直接在末尾添加光标
  return html + '<span class="input-cursor' + (isReasoning ? ' reasoning-cursor' : '') + '"></span>'
}

// 递归找到DOM下最后一个元素节点
const findLastElement = (element: HTMLElement): HTMLElement | null => {
  // 如果该DOM没有子元素，则返回自身
  if (!element.children.length) {
    return element
  }

  const lastChild = element.children[element.children.length - 1] as HTMLElement

  // 如果该元素是p标签或li标签，则返回自身
  if (lastChild.tagName === 'P' || lastChild.tagName === 'LI') {
    return lastChild
  }

  // 如果是pre标签，就在pre标签中找到code元素
  if (lastChild.tagName === 'PRE') {
    return (lastChild.getElementsByClassName('hljs')[0] as HTMLElement) || lastChild
  }

  // 如果最后一个子元素是元素节点，则递归查找
  if (lastChild.nodeType === Node.ELEMENT_NODE && lastChild.children.length > 0) {
    return findLastElement(lastChild)
  }

  return lastChild
}
</script>

<style scoped>
.user-message,
.ai-message {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-message {
  border-bottom-right-radius: 4px;
  box-shadow:
    0 6px 16px -8px rgba(var(--v-theme-primary), 0.25),
    0 9px 28px 0 rgba(var(--v-theme-primary), 0.1),
    0 12px 48px 16px rgba(var(--v-theme-primary), 0.05);
  transform: translateZ(0);
}

.user-message:hover {
  box-shadow:
    0 8px 20px -8px rgba(var(--v-theme-primary), 0.3),
    0 12px 32px 0 rgba(var(--v-theme-primary), 0.15),
    0 16px 52px 16px rgba(var(--v-theme-primary), 0.07);
  transform: translateY(-1px) translateZ(0);
}

.ai-message {
  border-bottom-left-radius: 4px;
  box-shadow:
    0 6px 16px -8px rgba(0, 0, 0, 0.08),
    0 9px 28px 0 rgba(0, 0, 0, 0.05),
    0 12px 48px 16px rgba(0, 0, 0, 0.03);
  transform: translateZ(0);
}

.ai-message:hover {
  box-shadow:
    0 8px 20px -8px rgba(0, 0, 0, 0.1),
    0 12px 32px 0 rgba(0, 0, 0, 0.07),
    0 16px 52px 16px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px) translateZ(0);
}

.user-message-container {
  position: relative;
}

.message-actions {
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: row;
  z-index: 1;
}

.user-message-container:hover .message-actions {
  opacity: 1;
}

.message-action-button {
  background-color: transparent !important;
  box-shadow: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.message-action-button:hover {
  background-color: rgb(var(--v-theme-surface)) !important;
  box-shadow:
    0 4px 12px rgba(var(--v-theme-primary), 0.2),
    0 0 8px rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.1);
}

.ai-message :deep(pre) {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.ai-message :deep(code) {
  font-family: 'Roboto Mono', monospace;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.9em;
}

.ai-message :deep(p) {
  margin-bottom: 12px;
  line-height: 1.5;
}

.ai-message :deep(ul),
.ai-message :deep(ol) {
  padding-left: 24px;
  margin-bottom: 12px;
}

.ai-message :deep(h1),
.ai-message :deep(h2),
.ai-message :deep(h3),
.ai-message :deep(h4),
.ai-message :deep(h5),
.ai-message :deep(h6) {
  margin-top: 16px;
  margin-bottom: 12px;
  font-weight: 600;
  line-height: 1.3;
}

.ai-message :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.ai-message :deep(a:hover) {
  border-bottom-color: rgb(var(--v-theme-primary));
}

.ai-message :deep(blockquote) {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.4);
  padding: 0 0 0 16px;
  margin: 12px 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-style: italic;
}

.ai-message :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 0.9em;
}

.ai-message :deep(th),
.ai-message :deep(td) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 8px;
  text-align: left;
}

.ai-message :deep(th) {
  background-color: rgba(var(--v-theme-primary), 0.05);
  font-weight: 600;
}

.ai-message :deep(tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.015);
}

.followup-questions-container {
  /* margin-top: -8px; */
  margin-bottom: 16px;
}

.followup-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.followup-chip:hover {
  transform: translateY(-2px);
}

.reasoning-header {
  cursor: pointer;
}

.reasoning-text :deep(pre) {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  padding: 8px;
  overflow-x: auto;
  font-family: monospace;
}

.reasoning-text :deep(code) {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.04);
  padding: 2px 4px;
  border-radius: 4px;
}

/* 添加新的光标样式 */
:deep(.input-cursor) {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-primary));
  margin-left: 2px;
  animation: pulse 1s infinite;
  vertical-align: middle;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
}

.cursor-pointer {
  cursor: pointer;
}

.branch-switcher {
  margin-top: -8px;
  border-radius: 8px;
  height: 28px;
}

.branch-counter {
  min-width: 28px;
  font-size: 0.75rem;
  opacity: 0.8;
  padding: 0 8px;
}

:deep(.reasoning-cursor) {
  background-color: rgb(var(--v-theme-info));
}

.edit-mode-card {
  border-bottom-right-radius: 4px;
}
</style>
