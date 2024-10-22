<template>
  <VuetifyTiptap
    ref="editor"
    v-model="content"
    rounded
    editor-class="tiptap-editor"
    :output="output"
    :min-height="minHeight"
    :max-height="maxHeight"
  />
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap'

import { computed, ref } from 'vue'
import { VuetifyTiptap } from 'vuetify-pro-tiptap'

const props = defineProps<{
  output?: 'json' | 'html' | 'text'
  minHeight?: number
  maxHeight?: number
}>()

const editor = ref<InstanceType<typeof VuetifyTiptap> | null>(null)

const editorInstance = computed(() => editor.value?.editor)

const content = defineModel<string | JSONContent>('content')

defineExpose({
  editor: editorInstance,
})
</script>
