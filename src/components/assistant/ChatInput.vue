<template>
  <div class="chat-input">
    <v-card flat class="input-card">
      <div class="input-container">
        <!-- 文件上传区域 -->
        <div v-if="attachedFiles.length > 0" class="attached-files pa-2">
          <v-chip
            v-for="(file, index) in attachedFiles"
            :key="index"
            closable
            class="mr-2 mb-2"
            @click:close="removeFile(index)"
          >
            <v-icon start :icon="getFileIcon(file.type)"></v-icon>
            {{ file.name }}
          </v-chip>
        </div>

        <!-- 输入区域 -->
        <div class="input-row d-flex align-center pa-2">
          <!-- 附件按钮 -->
          <v-menu>
            <template #activator="{ props }">
              <v-btn icon="mdi-attachment" size="small" variant="text" v-bind="props" class="mr-2"></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="triggerFileInput('image')">
                <v-list-item-title>
                  <v-icon start icon="mdi-image"></v-icon>
                  上传图片
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="triggerFileInput('document')">
                <v-list-item-title>
                  <v-icon start icon="mdi-file-document"></v-icon>
                  上传文档
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- 文本输入框 -->
          <v-textarea
            v-model="inputText"
            placeholder="输入您的问题或想法..."
            variant="plain"
            rows="1"
            auto-grow
            max-rows="5"
            hide-details
            class="flex-grow-1 custom-input"
            :disabled="loading"
            @keydown="handleKeydown"
          ></v-textarea>

          <!-- 发送/停止按钮 -->
          <v-btn
            :color="loading ? 'error' : 'primary'"
            size="small"
            class="ml-2 send-button"
            :disabled="!canSend"
            @click="handleAction"
          >
            <v-icon>{{ loading ? 'mdi-stop' : 'mdi-send' }}</v-icon>
            <v-tooltip activator="parent" location="top">
              {{ loading ? '停止生成' : '发送消息' }}
            </v-tooltip>
          </v-btn>
        </div>

        <!-- 输入提示 -->
        <div v-if="showHints" class="input-hints pa-2 pt-0">
          <div class="text-caption text-medium-emphasis">按 Enter 发送，Shift + Enter 换行</div>
        </div>
      </div>
    </v-card>

    <!-- 隐藏的文件输入 -->
    <input ref="fileInput" type="file" multiple style="display: none" @change="handleFileSelect" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

interface Props {
  modelValue: string
  loading?: boolean
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'send', message: string): void
  (e: 'stop'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  placeholder: '输入您的问题或想法...',
})

const emit = defineEmits<Emits>()

// 数据
const inputText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const attachedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement>()
const fileInputType = ref<'image' | 'document'>('image')
const showHints = ref(false)

// 计算属性
const canSend = computed(() => {
  return (inputText.value.trim() || attachedFiles.value.length > 0) && !props.loading
})

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift + Enter: 换行，不做处理
      return
    } else {
      // Enter: 发送消息
      event.preventDefault()
      handleSend()
    }
  }

  // 显示输入提示
  if (!showHints.value) {
    showHints.value = true
    setTimeout(() => {
      showHints.value = false
    }, 3000)
  }
}

// 处理发送/停止
const handleAction = () => {
  if (props.loading) {
    emit('stop')
  } else {
    handleSend()
  }
}

// 发送消息
const handleSend = () => {
  if (!canSend.value) return

  const message = inputText.value.trim()
  if (message || attachedFiles.value.length > 0) {
    // TODO: 处理附件
    emit('send', message)

    // 清空输入
    inputText.value = ''
    attachedFiles.value = []
  }
}

// 触发文件选择
const triggerFileInput = (type: 'image' | 'document') => {
  fileInputType.value = type

  if (fileInput.value) {
    // 设置文件类型限制
    if (type === 'image') {
      fileInput.value.accept = 'image/*'
    } else {
      fileInput.value.accept = '.pdf,.doc,.docx,.txt,.md'
    }

    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files) {
    for (const file of Array.from(files)) {
      // 检查文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        // TODO: 显示错误提示
        console.error('文件大小超过限制:', file.name)
        continue
      }

      // 检查文件类型
      if (fileInputType.value === 'image' && !file.type.startsWith('image/')) {
        console.error('文件类型不匹配:', file.name)
        continue
      }

      attachedFiles.value.push(file)
    }
  }

  // 清空input值，允许重复选择同一文件
  target.value = ''
}

// 移除文件
const removeFile = (index: number) => {
  attachedFiles.value.splice(index, 1)
}

// 获取文件图标
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return 'mdi-image'
  } else if (fileType.includes('pdf')) {
    return 'mdi-file-pdf-box'
  } else if (fileType.includes('word')) {
    return 'mdi-file-word'
  } else if (fileType.includes('text')) {
    return 'mdi-file-document'
  } else {
    return 'mdi-file'
  }
}
</script>

<style scoped>
.chat-input {
  max-width: 800px;
  margin: 0 auto;
}

.input-card {
  border-radius: 1rem;
  overflow: hidden;
  background-image: none;
}

.input-container {
  background-color: rgb(var(--v-theme-surface));
  background-image: none;
}

.input-row {
  min-height: 56px;
  align-items: center;
  display: flex;
  overflow: visible;
}

.v-textarea :deep(.v-field__input) {
  min-height: 40px;
  padding: 0;
  overflow: visible !important;
  clip-path: none !important;
  mask: none !important;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.v-textarea :deep(.v-field__field) {
  align-items: center;
  justify-content: center;
  min-height: 56px;
  display: flex;
}

/* 自定义输入框占位符样式 */
.custom-input :deep(.v-field__input) {
  color: rgba(var(--v-theme-on-surface), 0.87);
  background: none !important;
  background-image: none !important;
  background-clip: initial !important;
  -webkit-background-clip: initial !important;
  -webkit-text-fill-color: initial !important;
}

.custom-input :deep(.v-field__input)::placeholder {
  color: #9e9e9e !important;
  opacity: 1 !important;
  background: none !important;
  background-image: none !important;
  background-clip: initial !important;
  -webkit-background-clip: initial !important;
  -webkit-text-fill-color: #9e9e9e !important;
}

/* 强制移除任何可能的渐变效果 */
.custom-input :deep(.v-field),
.custom-input :deep(.v-field__field),
.custom-input :deep(.v-field__input),
.custom-input :deep(.v-field__append-inner),
.custom-input :deep(.v-field__prepend-inner) {
  background: none !important;
  background-image: none !important;
  background-clip: initial !important;
  -webkit-background-clip: initial !important;
  -webkit-text-fill-color: initial !important;
}

/* 确保输入框容器正确对齐 */
.custom-input :deep(.v-field) {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
}

.custom-input :deep(.v-field__field) {
  display: flex !important;
  align-items: center !important;
  min-height: inherit !important;
}

.custom-input :deep(textarea) {
  color: rgba(var(--v-theme-on-surface), 0.87) !important;
  background: none !important;
  background-image: none !important;
  background-clip: initial !important;
  -webkit-background-clip: initial !important;
  -webkit-text-fill-color: initial !important;
  overflow: visible !important;
  clip-path: none !important;
  mask: none !important;
  box-shadow: none !important;
  border: none !important;
  outline: none !important;
  resize: none !important;
  font-size: 14px !important;
  line-height: 20px !important;
  padding: 10px 0 !important;
  margin: 0 !important;
  vertical-align: middle !important;
  display: flex !important;
  align-items: center !important;
  min-height: 20px !important;
}

.custom-input :deep(textarea::placeholder) {
  color: #9e9e9e !important;
  opacity: 1 !important;
  background: none !important;
  background-image: none !important;
  background-clip: initial !important;
  -webkit-background-clip: initial !important;
  -webkit-text-fill-color: #9e9e9e !important;
  font-size: 14px !important;
  line-height: 20px !important;
  vertical-align: middle !important;
  overflow: visible !important;
  clip-path: none !important;
  mask: none !important;
  display: flex !important;
  align-items: center !important;
}

.input-hints {
  background-color: #f5f5f5;
}

/* 动画效果 */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: scale(1.05);
}

/* 发送按钮样式 */
.send-button {
  min-width: 40px !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.send-button .v-icon {
  font-size: 18px !important;
  color: inherit !important;
}

/* 文件上传区域样式 */
.v-chip {
  max-width: 200px;
}

.v-chip :deep(.v-chip__content) {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
