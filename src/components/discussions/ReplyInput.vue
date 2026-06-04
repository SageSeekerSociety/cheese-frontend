<template>
  <div class="reply-input-container">
    <TipTapEditor
      ref="editorRef"
      v-model:content="replyContent"
      :placeholder="placeholderText"
      :output="editorOutputFormat"
      @ready="handleEditorReady"
    />
    <div class="actions mt-2 d-flex justify-end">
      <v-btn variant="text" @click="handleCancel">{{ t('global.cancel') }}</v-btn>
      <v-btn color="primary" :loading="isSubmitting" :disabled="isSubmitDisabled" @click="handleSubmit">
        {{ t('global.reply') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap' // For content type
import type { DiscussableModelType, DiscussionWithUI } from '@/types'

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vuetify-sonner'

import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import { DiscussionsApi } from '@/network/api/discussions'

interface Props {
  parentId: number
  modelType: DiscussableModelType
  modelId: number
  placeholder?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Write a reply...',
  autofocus: false,
})

const emit = defineEmits<{
  (e: 'reply-submitted', newReply: DiscussionWithUI): void
  (e: 'cancel-reply'): void
}>()

const { t } = useI18n()

const editorRef = ref<InstanceType<typeof TipTapEditor> | null>(null)
const replyContent = ref<JSONContent | string | undefined>() // Align with TipTapEditor's defineModel
const isSubmitting = ref(false)
const editorOutputFormat = 'json' // Or 'html' depending on backend

const placeholderText = computed(() => props.placeholder || t('spaces.discussions.replyPlaceholder'))

const isSubmitDisabled = computed(() => {
  return !editorRef.value || editorRef.value.isEmpty || isSubmitting.value
})

const handleEditorReady = () => {
  if (props.autofocus && editorRef.value?.editor) {
    editorRef.value.editor.commands.focus()
  }
}

const handleSubmit = async () => {
  if (isSubmitDisabled.value || !editorRef.value?.editor) return

  isSubmitting.value = true
  try {
    const contentToSubmit = editorRef.value.editor.getJSON()

    // Basic check for empty content (Prosemirror doc with only one empty paragraph)
    if (
      !contentToSubmit ||
      (contentToSubmit.type === 'doc' &&
        contentToSubmit.content &&
        contentToSubmit.content.length === 1 &&
        !contentToSubmit.content[0].content &&
        Object.keys(contentToSubmit.content[0].attrs || {}).length === 0)
    ) {
      toast.warning(t('global.errorMessages.contentRequired'))
      isSubmitting.value = false
      return
    }

    const { data } = await DiscussionsApi.create({
      content: JSON.stringify(contentToSubmit), // API expects stringified JSON
      modelType: props.modelType,
      modelId: props.modelId,
      parentId: props.parentId,
    })
    toast.success(t('global.replySuccess'))
    emit('reply-submitted', data.discussion as DiscussionWithUI)
    if (editorRef.value?.editor) editorRef.value.editor.commands.clearContent(true)
    replyContent.value = undefined // Reset content model
  } catch (error) {
    console.error('Failed to submit reply:', error)
    toast.error(t('global.replyFailed'))
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  if (editorRef.value?.editor) {
    editorRef.value.editor.commands.clearContent(true)
  }
  replyContent.value = undefined // Reset content model
  emit('cancel-reply')
}

// Expose a clear method if needed by parent
defineExpose({
  clear: () => {
    if (editorRef.value?.editor) editorRef.value.editor.commands.clearContent(true)
    replyContent.value = undefined
  },
  focus: () => {
    if (editorRef.value?.editor) editorRef.value.editor.commands.focus()
  },
})
</script>

<style scoped lang="scss">
.reply-input-container {
  // Add styling as needed
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  padding: 12px;
  background-color: rgb(var(--v-theme-surface));

  .actions {
    gap: 8px;
  }
}
</style>
