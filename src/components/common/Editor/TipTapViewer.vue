<template>
  <EditorContent :editor="editor" readonly />
</template>

<script setup lang="ts">
import { JSONContent } from 'vuetify-pro-tiptap'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import {
  Bold,
  Italic,
  Underline,
  Strike,
  Color,
  Highlight,
  Heading,
  TextAlign,
  FontFamily,
  FontSize,
  SubAndSuperScript,
  BulletList,
  OrderedList,
  TaskList,
  Indent,
  Link,
  Video,
  Table,
  Blockquote,
  HorizontalRule,
  Code,
  CodeBlock,
  Clear,
  Fullscreen,
  History,
} from 'vuetify-pro-tiptap'

import AttachmentImage from '@/plugins/tiptap/extensions/image'
import { onUnmounted, toRefs, watch } from 'vue'

const props = defineProps<{
  value: string | JSONContent
}>()

const { value } = toRefs(props)

const editor = useEditor({
  content: value.value,
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Underline,
    Strike,
    Color,
    Highlight,
    Heading,
    TextAlign,
    FontFamily,
    FontSize,
    SubAndSuperScript,
    // BulletList,
    // OrderedList,
    // TaskList,
    // Indent,
    // Link,
    // Video,
    Table,
    Blockquote,
    HorizontalRule,
    Code,
    CodeBlock,
    AttachmentImage,
  ],
  editable: false,
})

watch(
  value,
  (newValue) => {
    console.log(newValue)
    editor.value?.commands.setContent(newValue)
  },
  { immediate: true }
)

onUnmounted(() => {
  editor.value?.destroy()
})
</script>
