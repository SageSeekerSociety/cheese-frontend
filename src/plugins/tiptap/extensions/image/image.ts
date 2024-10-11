import { mergeAttributes, Node } from '@tiptap/core'
import type { ButtonView, GeneralOptions } from 'vuetify-pro-tiptap'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageView from './ImageView.vue'
import ImageActionButton from './ImageActionButton.vue'

export interface AttachmentImageOptions extends GeneralOptions<AttachmentImageOptions> {
  /**
   * HTML attributes to add to the image element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  button: ButtonView
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    attachmentImage: {
      /**
       * Add an image
       * @param options The image attributes
       * @example
       * editor
       *   .commands
       *   .setImage({ attachmentId: 1, alt: 'tiptap', title: 'tiptap logo', width: 100, height: 100 })
       */
      setImage: (options: {
        attachmentId: number
        alt?: string
        title?: string
        width?: number
        height?: number
      }) => ReturnType
    }
  }
}

/**
 * This extension allows you to insert images.
 */
export const AttachmentImage = Node.create<AttachmentImageOptions>({
  name: 'attachmentImage',

  priority: 500,

  addOptions() {
    return {
      HTMLAttributes: {},
      divider: false,
      spacer: false,
      button: ({ editor }) => ({
        component: ImageActionButton,
        componentProps: {
          editor,
          disabled: !editor.can().setImage({}),
        },
      }),
    }
  },

  inline: false,

  group: 'block',

  content: 'text*',

  draggable: true,

  defining: true,

  addAttributes() {
    return {
      attachmentId: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageView as any)
  },

  parseHTML() {
    return [
      {
        tag: 'attachment-img',
        getAttrs: (node) => {
          const attachmentId = node.getAttribute('attachmentId')
          const alt = node.getAttribute('alt')
          const title = node.getAttribute('title')
          const width = node.getAttribute('width')
          const height = node.getAttribute('height')
          return {
            attachmentId: attachmentId ? Number(attachmentId) : null,
            alt: alt,
            title: title,
            width: width,
            height: height,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['attachment-img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
