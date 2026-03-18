<template>
  <div class="chat-input">
    <v-textarea
      v-model="inputText"
      :placeholder="props.placeholder"
      variant="plain"
      color="transparent"
      rows="2"
      auto-grow
      max-rows="8"
      hide-details
      class="chat-input__textarea"
      :disabled="isLoading"
      @keydown="handleKeydown"
    ></v-textarea>

    <div v-if="attachedFiles.length > 0" class="chat-input__attachments">
      <v-chip
        v-for="(file, index) in attachedFiles"
        :key="index"
        closable
        size="small"
        class="chat-input__attachment-chip"
        @click:close="removeFile(index)"
      >
        <v-icon start :icon="getFileIcon(file.type)"></v-icon>
        {{ file.name }}
      </v-chip>
    </div>

    <div class="chat-input__toolbar px-2 my-2">
      <div class="chat-input__toolbar-left">
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn icon="mdi-attachment" variant="text" v-bind="menuProps" size="small"></v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="triggerFileInput('image')">
              <v-list-item-title class="d-flex align-center">
                <v-icon start icon="mdi-image"></v-icon>
                上传图片
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="triggerFileInput('document')">
              <v-list-item-title class="d-flex align-center">
                <v-icon start icon="mdi-file-document"></v-icon>
                上传文档
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div class="chat-input__toolbar-right">
        <v-btn
          color="primary"
          variant="tonal"
          class="chat-input__send-icon"
          :disabled="!canSend"
          size="small"
          :icon="isLoading ? 'mdi-stop' : 'mdi-send'"
          @click="handleAction"
        >
        </v-btn>
      </div>
    </div>

    <input ref="fileInput" type="file" multiple class="chat-input__file" @change="handleFileSelect" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

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

const inputText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const attachedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement>()
const fileInputType = ref<'image' | 'document'>('image')
const isLoading = computed(() => props.loading)

const canSend = computed(() => (inputText.value.trim() || attachedFiles.value.length > 0) && !props.loading)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const handleAction = () => {
  if (props.loading) {
    emit('stop')
  } else {
    handleSend()
  }
}

const handleSend = () => {
  if (!canSend.value) return

  const message = inputText.value.trim()
  if (message || attachedFiles.value.length > 0) {
    // TODO: 处理附件
    emit('send', message)
    inputText.value = ''
    attachedFiles.value = []
  }
}

const triggerFileInput = (type: 'image' | 'document') => {
  fileInputType.value = type
  if (!fileInput.value) return

  fileInput.value.accept = type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt,.md'
  fileInput.value.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  for (const file of Array.from(files)) {
    if (file.size > 10 * 1024 * 1024) {
      console.error('文件大小超过限制:', file.name)
      continue
    }
    if (fileInputType.value === 'image' && !file.type.startsWith('image/')) {
      console.error('文件类型不匹配:', file.name)
      continue
    }
    attachedFiles.value.push(file)
  }

  target.value = ''
}

const removeFile = (index: number) => {
  attachedFiles.value.splice(index, 1)
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'mdi-image'
  if (fileType.includes('pdf')) return 'mdi-file-pdf-box'
  if (fileType.includes('word')) return 'mdi-file-word'
  if (fileType.includes('text')) return 'mdi-file-document'
  return 'mdi-file'
}
</script>

<style scoped>
.chat-input {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.chat-input__textarea {
  width: 100%;
  padding: 0px 16px;
}

.chat-input__attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chat-input__attachment-chip {
  max-width: 220px;
}

.chat-input__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chat-input__toolbar-left,
.chat-input__toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-input__toolbar-left .v-btn {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.chat-input__file {
  display: none;
}
</style>
