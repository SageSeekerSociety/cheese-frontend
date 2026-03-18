<template>
  <div class="assistant-message" :class="containerClass">
    <v-card
      variant="flat"
      :class="[
        'assistant-message__bubble',
        bubbleCardClass,
        { 'assistant-message__bubble--typing': message.isTyping && isAssistantMessage },
      ]"
    >
      <v-card-text v-if="isUserMessage" class="assistant-message__content assistant-message__content--user">
        {{ message.content }}
      </v-card-text>

      <v-card-text v-else class="assistant-message__content">
        <details v-if="thinkingParts.length" class="assistant-message__thinking-group">
          <summary>
            <v-icon size="small" class="me-1 assistant-message__thinking-icon">mdi-brain</v-icon>
            <span>{{ thinkingSummary }}</span>
            <v-icon size="small" class="assistant-message__preface-icon">mdi-chevron-down</v-icon>
          </summary>
          <div class="assistant-message__thinking-body">
            <div class="assistant-message__timeline">
              <div
                v-for="(part, index) in thinkingParts"
                :key="`thinking-${index}`"
                class="assistant-message__timeline-row"
              >
                <div class="assistant-message__timeline-axis">
                  <span class="assistant-message__timeline-dot"></span>
                  <span v-if="index < thinkingParts.length - 1" class="assistant-message__timeline-line"></span>
                </div>
                <div class="assistant-message__timeline-content">
                  <div v-if="part.kind === 'thinking'" class="assistant-message__thinking">
                    <pre>{{ part.text }}</pre>
                  </div>
                  <ToolCard v-else-if="part.kind === 'tool'" :part="part" dense />
                </div>
              </div>
            </div>
          </div>
        </details>

        <div v-blinking-cursor="{ isStreaming: message.isTyping }" class="assistant-message__body">
          <template v-if="bodyParts.length">
            <template v-for="(part, index) in bodyParts" :key="`body-${index}`">
              <div
                v-if="part.kind === 'text'"
                v-cite-markers
                class="assistant-message__markdown"
                v-html="renderMarkdown(part.text)"
              ></div>

              <ToolCard v-else-if="part.kind === 'tool'" :part="part" class="assistant-message__tool-card" />

              <div v-else-if="part.kind === 'divider'" class="assistant-message__divider">
                <span>{{ part.label ?? '——' }}</span>
              </div>

              <div v-else-if="part.kind === 'error'" class="assistant-message__error">
                <v-icon size="small" color="error" class="me-1">mdi-alert-circle</v-icon>
                {{ part.text }}
              </div>
            </template>
          </template>

          <div
            v-else-if="hasFallbackContent"
            class="assistant-message__markdown"
            v-html="renderMarkdown(message.content ?? '')"
          ></div>
        </div>
      </v-card-text>
    </v-card>
  </div>

  <div v-if="showActions" class="assistant-message__actions">
    <v-btn
      v-for="action in actionButtons"
      :key="action.icon"
      v-tooltip="action.label"
      size="small"
      variant="text"
      density="comfortable"
      :icon="action.icon"
      color="primary"
      @click="action.handler"
    />
  </div>
</template>

<script setup lang="ts">
import 'prismjs/themes/prism.css'

import type { AssistantMessage, MessagePart } from '@/types/assistant'

import { computed } from 'vue'

import ToolCard from './ToolCard.vue'

import { vBlinkingCursor } from '@/components/chat/directives/cursor-directive'
import { MarkdownRenderer } from '@/components/chat/services/markdownRenderer'

const props = defineProps<{
  message: AssistantMessage
}>()

const markdownRenderer = new MarkdownRenderer()

const isUserMessage = computed(() => props.message.role === 'user')
const isAssistantMessage = computed(() => props.message.role === 'assistant')

const containerClass = computed(() => ({
  'assistant-message--user': isUserMessage.value,
  'assistant-message--assistant': isAssistantMessage.value,
}))

const bubbleCardClass = computed(() =>
  isUserMessage.value ? 'assistant-message__bubble--user' : 'assistant-message__bubble--ai'
)

const parts = computed(() => props.message.parts ?? [])

const thinkingParts = computed(() =>
  parts.value.filter(
    (part): part is Extract<MessagePart, { kind: 'thinking' }> | Extract<MessagePart, { kind: 'tool' }> =>
      part.kind === 'thinking' || (part.kind === 'tool' && part.phase === 'preface')
  )
)

const bodyParts = computed(() =>
  parts.value.filter((part) => {
    if (part.kind === 'thinking') return false
    if (part.kind === 'tool' && part.phase === 'preface') return false
    return true
  })
)

const hasFallbackContent = computed(() => Boolean(props.message.content) && !parts.value.length)

const renderMarkdown = (text: string) => markdownRenderer.render(text)

const thinkingStartTs = computed(() => {
  const thinkingTs = thinkingParts.value.map((part) => part.ts)
  return thinkingTs.length ? Math.min(...thinkingTs) : null
})

const bodyStartTs = computed(() => {
  const bodyTs = bodyParts.value.map((part) => part.ts)
  return bodyTs.length ? Math.min(...bodyTs) : null
})

const thinkingCompleted = computed(() => !props.message.isTyping && thinkingParts.value.length > 0)

const thinkingEndTs = computed(() => {
  if (!thinkingCompleted.value) return null
  if (bodyStartTs.value != null) return bodyStartTs.value
  const tsList = thinkingParts.value.map((part) => part.ts)
  return tsList.length ? Math.max(...tsList) : null
})

const thinkingDurationMs = computed(() => {
  if (!thinkingCompleted.value) return 0
  const start = thinkingStartTs.value
  const end = thinkingEndTs.value
  if (start == null || end == null) return 0
  return Math.max(0, end - start)
})

const formatDuration = (ms: number) => {
  if (ms <= 0) return '不到 1 秒'
  const totalSeconds = Math.floor(ms / 1000)
  if (totalSeconds < 60) {
    if (totalSeconds === 0) return '不到 1 秒'
    return `${totalSeconds} 秒`
  }
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const segments: string[] = []
  if (hours) segments.push(`${hours} 小时`)
  if (minutes) segments.push(`${minutes} 分`)
  if (seconds) segments.push(`${seconds} 秒`)
  return segments.join('')
}

const thinkingSummary = computed(() => {
  if (!thinkingParts.value.length) return '思考过程'
  if (!thinkingCompleted.value) return props.message.isTyping ? '思考过程 · 思考中…' : '思考过程'
  const duration = thinkingDurationMs.value
  if (!duration) return '思考过程 · 思考不到 1 秒'
  return `思考过程 · 思考 ${formatDuration(duration)}`
})

const showActions = computed(() => isAssistantMessage.value && !props.message.isTyping)

const actionButtons = computed(() => [
  { icon: 'mdi-content-copy', label: '复制', handler: copyMessage },
  { icon: 'mdi-thumb-up-outline', label: '有帮助', handler: likeMessage },
  { icon: 'mdi-thumb-down-outline', label: '没帮助', handler: dislikeMessage },
  { icon: 'mdi-refresh', label: '重新生成', handler: regenerateMessage },
])

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content ?? '')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const likeMessage = () => {
  console.log('点赞消息:', props.message.id)
}

const dislikeMessage = () => {
  console.log('踩消息:', props.message.id)
}

const regenerateMessage = () => {
  console.log('重新生成消息:', props.message.id)
}
</script>

<style scoped lang="scss">
.assistant-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.assistant-message--user {
  justify-content: flex-end;
}

.assistant-message--assistant {
  justify-content: center;
}

.assistant-message__bubble {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  font-size: 1rem;
}

.assistant-message__bubble--typing {
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.12) inset;
}

.assistant-message--user .assistant-message__bubble {
  width: auto;
  max-width: min(80%, 580px);
  border-bottom-right-radius: 4px;
}

.assistant-message__bubble--user {
  background: rgba(var(--v-theme-surface-light), 0.95);
}

.assistant-message__bubble--ai {
  background: transparent;
  box-shadow: none;
}

.assistant-message__content {
  padding: 16px 18px;
  line-height: 1.65;
}

.assistant-message__content--user {
  white-space: pre-wrap;
  color: rgba(var(--v-theme-on-surface), 0.92);
}

.assistant-message__thinking-group {
  margin-bottom: 12px;
  padding: 6px 4px 0;

  summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgba(var(--v-theme-on-surface), 0.65);
    font-weight: 500;
  }

  .assistant-message__thinking-icon {
    color: rgba(var(--v-theme-on-surface), 0.45);
  }

  .assistant-message__preface-icon {
    margin-left: auto;
    transition: transform 0.2s ease;
    color: rgba(var(--v-theme-on-surface), 0.45);
  }

  summary::-webkit-details-marker {
    display: none;
  }
}

.assistant-message__thinking-group[open] .assistant-message__preface-icon {
  transform: rotate(180deg);
}

.assistant-message__thinking-body {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.assistant-message__timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.assistant-message__timeline-row {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 12px;
  align-items: flex-start;
}

.assistant-message__timeline-axis {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.assistant-message__timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 0 0 2px rgba(var(--v-theme-surface), 1);
}

.assistant-message__timeline-line {
  display: block;
  flex: 1;
  width: 1px;
  background: linear-gradient(to bottom, rgba(var(--v-theme-primary), 0.18), rgba(var(--v-theme-primary), 0.05));
}

.assistant-message__timeline-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assistant-message__thinking pre {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  white-space: pre-wrap;
  background: transparent;
  border-radius: 6px;
  padding: 0;
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.assistant-message__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.assistant-message__markdown {
  font-size: 1rem;

  :deep(pre) {
    background-color: rgba(var(--v-theme-surface-light), 0.5);
    padding: 12px;
    border-radius: 10px;
    overflow-x: auto;
    margin: 12px 0;
    font-size: 0.85rem;
  }

  :deep(p) {
    margin-bottom: 12px;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 24px;
    margin-bottom: 12px;
  }

  :deep(blockquote) {
    border-left: 4px solid rgba(var(--v-theme-primary), 0.35);
    padding-left: 12px;
    margin: 12px 0;
    color: rgba(var(--v-theme-on-surface), 0.7);
    font-style: italic;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: 8px 12px;
    text-align: left;
    border-color: rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.08);
  }

  :deep(tr:nth-child(even)) {
    background-color: rgba(255, 255, 255, 0.12);
  }
}

.assistant-message__tool-card {
  margin: 4px 0;
}

.assistant-message__divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.45);
  font-size: 0.8rem;
}

.assistant-message__divider::before,
.assistant-message__divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.2);
  margin: 0 12px;
}

.assistant-message__error {
  background-color: rgba(var(--v-theme-error), 0.1);
  border: 1px solid rgba(var(--v-theme-error), 0.3);
  border-radius: 8px;
  padding: 12px 14px;
  color: rgba(var(--v-theme-error), 0.9);
  display: flex;
  align-items: center;
}

.assistant-message__placeholder {
  padding: 8px 0;
}

.assistant-message__actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  margin-left: 48px;
}

.assistant-message__actions .v-btn {
  opacity: 0.75;
  transition: opacity 0.2s ease;
}

.assistant-message__actions .v-btn:hover {
  opacity: 1;
}

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
</style>
