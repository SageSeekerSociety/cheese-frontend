import 'vuetify-pro-tiptap/style.css'

import { createVuetifyProTipTap, VuetifyTiptap, VuetifyViewer } from 'vuetify-pro-tiptap'
import {
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeBlock,
  Color,
  FontFamily,
  FontSize,
  Fullscreen,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Indent,
  Italic,
  Link,
  OrderedList,
  Strike,
  SubAndSuperScript,
  Table,
  TaskList,
  TextAlign,
  Underline,
} from 'vuetify-pro-tiptap'

import { AttachmentImage } from './extensions/image'

export const vuetifyProTipTap = createVuetifyProTipTap({
  lang: 'zhHans',
  components: {
    VuetifyTiptap,
    VuetifyViewer,
  },
  extensions: [
    BaseKit.configure({
      placeholder: {
        placeholder: '输入内容...',
      },
    }),
    Bold,
    Italic,
    Underline,
    Strike,
    Code.configure({ divider: true }),
    Heading,
    TextAlign,
    FontFamily,
    FontSize,
    Color,
    Highlight.configure({ divider: true }),
    SubAndSuperScript.configure({ divider: true }),
    Clear.configure({ divider: true }),
    BulletList,
    OrderedList,
    TaskList,
    Indent.configure({ divider: true }),
    Link,
    AttachmentImage,
    Table.configure({ divider: true }),
    Blockquote,
    HorizontalRule,
    CodeBlock.configure({ divider: true }),
    History.configure({ divider: true }),
    Fullscreen,
  ],
})
