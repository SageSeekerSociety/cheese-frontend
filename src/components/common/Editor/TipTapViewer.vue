<template>
  <EditorContent :editor="editor" readonly />
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap'

import { onUnmounted, toRefs, watch } from 'vue'
import {
  Blockquote,
  Bold,
  Code,
  CodeBlock,
  Color,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalRule,
  Indent,
  Italic,
  Strike,
  SubAndSuperScript,
  TextAlign,
  Underline,
} from 'vuetify-pro-tiptap'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/vue-3'

import AttachmentImage from '@/plugins/tiptap/extensions/image'

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
    HardBreak,
    Bold,
    Italic,
    Underline,
    Strike,
    Color,
    Highlight,
    Heading,
    TextAlign,
    TextStyle,
    FontFamily,
    FontSize,
    SubAndSuperScript,
    BulletList,
    OrderedList,
    TaskList,
    TaskItem,
    Indent.configure({ divider: true }),
    Link,
    ListItem,
    Table.configure({
      HTMLAttributes: {
        class: 'cheese-table',
      },
    }),
    TableCell,
    TableHeader,
    TableRow,
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

<style lang="scss">
.cheese-table {
  // 表格基础样式
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  border: 2px solid rgb(var(--v-theme-primary));

  // 表格单元格样式
  td,
  th {
    border: 1px solid rgb(var(--v-theme-primary));
    padding: 0.75rem;
  }

  // 表头样式
  thead {
    th {
      background-color: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-on-primary));
      font-weight: 600;
    }
  }

  // 表格体样式
  tbody {
    tr {
      transition: background-color 0.2s ease;

      &:nth-child(even) {
        background-color: rgba(var(--v-theme-primary), 0.1);
      }

      &:hover {
        background-color: rgba(var(--v-theme-primary), 0.2);
      }
    }

    td {
      transition: background-color 0.2s ease;
    }
  }
}

// 确保表格在小屏幕上可以水平滚动
.ProseMirror {
  .tableWrapper {
    overflow-x: auto;
    max-width: 100%;
    margin: 1rem 0;
  }
}
</style>
