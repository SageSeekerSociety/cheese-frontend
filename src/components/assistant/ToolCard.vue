<template>
  <v-card
    class="tool-card"
    :class="{ 'tool-card--dense': dense }"
    :variant="dense ? 'flat' : 'tonal'"
    :elevation="dense ? 0 : 1"
  >
    <div class="tool-card__header">
      <div class="tool-card__title">
        <v-icon size="small" color="primary" class="me-1">mdi-wrench</v-icon>
        <span>{{ headerLabel }} · {{ part.name }}</span>
      </div>
      <v-chip size="x-small" :color="statusColor" variant="tonal" class="tool-card__status">
        {{ statusText }}
      </v-chip>
    </div>

    <div v-if="hasInput" class="tool-card__section">
      <div class="tool-card__section-title">输入</div>
      <pre v-if="inputDisplay.isJson" class="tool-card__pre">{{ inputDisplay.text }}</pre>
      <div v-else class="tool-card__text">{{ inputDisplay.text }}</div>
    </div>

    <div v-if="hasResult" class="tool-card__section">
      <div class="tool-card__section-title">输出</div>
      <pre v-if="isResultJson" class="tool-card__pre">{{ resultContent }}</pre>
      <div v-else class="tool-card__text">{{ resultContent }}</div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { MessagePart } from '@/types/assistant'

import { computed } from 'vue'

import { formatJsonBlock } from '@/utils/format'

type ToolPart = Extract<MessagePart, { kind: 'tool' }>

const props = defineProps<{
  part: ToolPart
  dense?: boolean
}>()

const headerLabel = computed(() => '工具调用')

const statusText = computed(() => {
  switch (props.part.status) {
    case 'calling':
      return '调用中'
    case 'success':
      return '完成'
    case 'error':
    default:
      return '失败'
  }
})

const statusColor = computed(() => {
  switch (props.part.status) {
    case 'calling':
      return 'warning'
    case 'success':
      return 'success'
    case 'error':
    default:
      return 'error'
  }
})

interface DisplayValue {
  text: string
  isJson: boolean
}

const normaliseValue = (value: unknown): DisplayValue => {
  if (value == null) return { text: '', isJson: false }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return { text: '', isJson: false }
    try {
      JSON.parse(trimmed)
      return { text: formatJsonBlock(trimmed), isJson: true }
    } catch {
      return { text: trimmed, isJson: false }
    }
  }

  try {
    return { text: formatJsonBlock(value), isJson: true }
  } catch (error) {
    console.warn('无法序列化工具值:', error)
    return { text: String(value), isJson: false }
  }
}

const inputDisplay = computed(() => normaliseValue(props.part.input))
const hasInput = computed(() => Boolean(inputDisplay.value.text))

const resultDisplay = computed(() => normaliseValue(props.part.result))
const resultContent = computed(() => resultDisplay.value.text)
const isResultJson = computed(() => resultDisplay.value.isJson)
const hasResult = computed(() => Boolean(resultContent.value))
</script>

<style scoped lang="scss">
.tool-card {
  border-radius: 10px;
  padding: 12px 14px;
  background-color: rgba(var(--v-theme-surface), 0.6);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-card--dense {
  padding: 0;
  background-color: transparent;
  gap: 10px;
}

.tool-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.tool-card__title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-size: 0.95rem;
}

.tool-card--dense .tool-card__title {
  font-weight: 500;
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.tool-card--dense .tool-card__header {
  gap: 8px;
}

.tool-card__section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tool-card__section-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.55);
  letter-spacing: 0.5px;
}

.tool-card--dense .tool-card__section-title {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-weight: 500;
}

.tool-card__pre {
  margin: 0;
  padding: 10px 12px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  line-height: 1.45;
  white-space: pre-wrap;
  overflow-x: auto;
}

.tool-card--dense .tool-card__pre {
  padding: 8px 10px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.tool-card__text {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  font-size: 0.9rem;
  line-height: 1.5;
  word-break: break-word;
}

.tool-card--dense .tool-card__text {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.65);
}
</style>
