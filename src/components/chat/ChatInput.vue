<template>
  <div class="chat-input-container d-flex flex-column">
    <!-- 新增上下文标签区域 -->
    <div v-if="contextChips && contextChips.length > 0" class="d-flex align-center flex-row flex-wrap gap-1 mb-1">
      <v-chip
        v-for="(chip, index) in contextChips"
        :key="index"
        :color="chip.color || 'default'"
        :variant="chip.variant || 'tonal'"
        size="small"
        :prepend-icon="chip.icon"
      >
        {{ chip.label }}
      </v-chip>
    </div>

    <div class="d-flex align-center">
      <v-textarea
        v-model="userInput"
        rows="1"
        max-rows="5"
        auto-grow
        hide-details
        density="compact"
        variant="plain"
        class="chat-input-field"
        placeholder="输入您的问题..."
        @keydown.enter="onKeyDown"
      ></v-textarea>
    </div>

    <div class="d-flex justify-space-between align-center mt-2">
      <div class="d-flex align-center">
        <div v-if="showModelOptions">
          <v-chip
            :color="selectedModel === 'reasoning' ? 'primary' : undefined"
            variant="tonal"
            class="model-selector-chip"
            prepend-icon="mdi-brain"
            @click="toggleModelType"
          >
            <span>深度思考</span>
          </v-chip>
        </div>
      </div>

      <v-btn
        :disabled="!canSubmit || disabled"
        :loading="disabled"
        :color="canSubmit ? 'primary' : ''"
        size="small"
        variant="tonal"
        elevation="0"
        icon
        @click="onSubmit"
      >
        <v-icon>mdi-send</v-icon>
        <v-tooltip activator="parent" location="top">发送</v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { ContextChip } from './types'

// 直接使用导入的接口定义
const props = defineProps<{
  disabled?: boolean
  showModelOptions?: boolean
  contextChips?: ContextChip[] // 使用导入的接口类型
}>()

const userInput = defineModel<string>({ required: true })
const selectedModel = defineModel<'standard' | 'reasoning'>('modelType', { required: true })

const emit = defineEmits<{
  (e: 'submit'): void
}>()

// 计算是否可以提交
const canSubmit = computed(() => userInput.value.trim().length > 0)

// 切换模型类型
const toggleModelType = () => {
  selectedModel.value = selectedModel.value === 'standard' ? 'reasoning' : 'standard'
}

// 键盘事件处理
const onKeyDown = (e: KeyboardEvent) => {
  // 如果按下Enter键且同时按下Shift键，允许换行
  if (e.key === 'Enter' && e.shiftKey) {
    return // 不阻止默认行为，允许换行
  }

  // 如果只按下Enter键，则阻止默认行为并发送消息
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (canSubmit.value && !props.disabled) {
      onSubmit()
    }
  }
}

// 提交消息处理
const onSubmit = () => {
  if (!canSubmit.value || props.disabled) return
  emit('submit')
  userInput.value = ''
}
</script>

<style scoped>
.chat-input-container {
  padding: 8px 16px 12px;
  background: var(--v-theme-surface);
  border-top: 1px solid rgba(var(--v-border-color), 0.1);
}

.chat-input-field {
  font-size: 0.95rem;
}

.model-selector-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.model-selector-chip:hover {
  opacity: 0.9;
}
</style>
