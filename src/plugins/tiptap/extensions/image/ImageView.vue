<template>
  <node-view-wrapper class="attachment-image-component">
    <v-lazy transition="fade-transition">
      <v-img v-if="realUrl" :src="realUrl" :aspect-ratio="aspectRatio" class="image" :max-width="maxWidth" />
    </v-lazy>
    <node-view-content class="image-caption text-medium-emphasis" />
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import { onMounted, computed, ref } from 'vue'
import { AttachmentsApi } from '@/network/api/attachments'
import { getFullAttachmentUrl } from '@/utils/materials'

const props = defineProps(nodeViewProps)
const realUrl = ref<string | null>(null)

const aspectRatio = computed(() => {
  const { width, height } = props.node.attrs
  if (width && height) {
    return width / height
  }
  return 16 / 9
})

const maxWidth = computed(() => {
  const { width } = props.node.attrs
  if (width) {
    return width
  }
  return undefined
})

onMounted(async () => {
  console.log(props)
  const { attachmentId } = props.node.attrs
  if (attachmentId) {
    const {
      data: { attachment },
    } = await AttachmentsApi.detail(attachmentId)
    realUrl.value = getFullAttachmentUrl(attachment.url)
  }
})
</script>

<style lang="scss">
.tiptap {
  .attachment-image-component {
    position: relative;
    text-align: center;

    .image {
      margin: 0 auto;
    }

    &.is-editor-empty:not(.focus) {
      .image-caption::before {
        content: '点击添加图片描述';
        color: var(--v-theme-medium-emphasis);
      }
    }

    &.focus {
      .image {
        border: 2px solid var(--v-theme-primary);
      }
    }
  }

  .image-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .image-caption {
    margin-top: 10px;
    text-align: center;
  }
}
</style>
