<template>
  <VuetifyTiptap
    ref="editor"
    v-model="content"
    rounded
    editor-class="tiptap-editor"
    :output="output"
    :min-height="minHeight"
    :max-height="maxHeight"
    :hide-toolbar="hideToolbar"
    :dense="dense"
    flat
  >
    <template #bottom>
      <slot name="bottom"></slot>
    </template>
  </VuetifyTiptap>
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap'

import { computed, ref } from 'vue'
import { VuetifyTiptap } from 'vuetify-pro-tiptap'

const props = defineProps<{
  output?: 'json' | 'html' | 'text'
  minHeight?: number
  maxHeight?: number
  hideToolbar?: boolean
  dense?: boolean
}>()

const editor = ref<InstanceType<typeof VuetifyTiptap> | null>(null)

const editorInstance = computed(() => editor.value?.editor)

const isEmpty = computed(() => {
  return editorInstance.value?.isEmpty ?? true
})

const content = defineModel<string | JSONContent>('content')

defineExpose({
  editor: editorInstance,
  isEmpty,
})
</script>

<style lang="scss">
.vuetify-pro-tiptap-editor {
  overflow: visible;
}
</style>
