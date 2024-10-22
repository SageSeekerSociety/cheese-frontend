<template>
  <div>
    <div class="d-flex flex-row align-center">
      <v-icon v-if="content.type === 'TEXT'">mdi-text</v-icon>
      <v-icon v-else-if="content.type === 'FILE'">mdi-file-document-outline</v-icon>
      <span class="text-h6">{{ content.title }}</span>
    </div>
    <div v-if="content.contentText">{{ content.contentText }}</div>
    <div v-else-if="content.contentAttachment">
      <v-card
        border
        flat
        class="file-card d-flex flex-row align-center"
        :href="getFullAttachmentUrl(content.contentAttachment.url)"
        target="_blank"
      >
        <v-icon class="text-medium-emphasis" size="36">mdi-file-document-outline</v-icon>
        <div class="d-flex flex-column">
          <div class="text-body-1">{{ (content.contentAttachment.meta as FileMeta).name }}</div>
          <div class="text-caption">{{ formatFileSize(content.contentAttachment.meta.size) }}</div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileMeta, TaskSubmissionContent } from '@/types'

import { formatFileSize, getFullAttachmentUrl } from '@/utils/materials'

defineProps<{
  content: TaskSubmissionContent
}>()
</script>

<style scoped>
.file-card {
  gap: 4px;
  padding: 8px;
}
</style>
