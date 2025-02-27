<template>
  <div :id="props.holder"></div>
</template>

<script setup lang="ts">
import type { EditorConfig } from '@editorjs/editorjs'

import { onMounted, ref } from 'vue'
import EditorJS from '@editorjs/editorjs'

const emit = defineEmits<{
  create: [editor: EditorJS]
  ready: [editor: EditorJS]
}>()

const props = withDefaults(
  defineProps<{
    holder: string
    config: EditorConfig
  }>(),
  {
    holder: 'editor',
    config: () => ({}),
  }
)
const editor = ref<EditorJS | null>(null)

const destroyEditor = () => {
  if (editor.value) {
    editor.value.destroy()
    editor.value = null
  }
}

const initEditor = () => {
  destroyEditor()
  const editorInstance = new EditorJS({
    holder: props.holder || 'editor',
    ...props.config,
  })
  editor.value = editorInstance
  emit('create', editorInstance)
  editorInstance.isReady.then(() => {
    emit('ready', editorInstance)
  })
}

onMounted(() => {
  initEditor()
})

defineExpose({
  editor,
})
</script>
