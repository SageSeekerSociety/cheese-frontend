<template>
  <div class="notification-content">
    <div class="text-subtitle-2 font-weight-medium">{{ title }}</div>
    <div class="text-body-2 text-medium-emphasis mt-1">{{ body }}</div>
    <div v-if="previewContent" class="text-body-2 text-medium-emphasis mt-2 preview-box">
      <v-icon icon="mdi-text-box-outline" size="14" class="me-1 text-medium-emphasis" />
      {{ previewContent }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationRenderProps, RenderedNotificationContent } from './NotificationRenderUtils'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { getEntity, getStringMetadata } from './NotificationRenderUtils'

const props = defineProps<NotificationRenderProps>()
const { t } = useI18n()

// 获取实体和元数据
const mentioner = computed(() => getEntity(props.notification, 'mentioner'))
const discussionTitle = computed(() => getStringMetadata(props.notification, 'discussionTitle', ''))
const discussionId = computed(() => getStringMetadata(props.notification, 'discussionId', ''))
const commentId = computed(() => getStringMetadata(props.notification, 'commentId', ''))
const previewContent = computed(() => getStringMetadata(props.notification, 'previewContent', ''))

// 通知标题
const title = computed(() => {
  if (!mentioner.value) return t('notifications.MENTION.title_anonymous')
  return t('notifications.MENTION.title', { mentioner: mentioner.value.name })
})

// 通知内容
const body = computed(() => {
  return t('notifications.MENTION.body', {
    discussionTitle: discussionTitle.value || t('notifications.common.unknownDiscussion'),
  })
})

// 构建路由链接
const routerLink = computed(() => {
  if (discussionId.value) {
    return {
      name: 'DiscussionDetail',
      params: { id: discussionId.value },
      query: commentId.value ? { comment: commentId.value } : undefined,
    }
  }
  return undefined
})

// 导出渲染结果，供父组件使用
const content = computed<RenderedNotificationContent>(() => ({
  title: title.value,
  body: body.value,
  routerLink: routerLink.value,
}))

defineExpose({
  content,
})
</script>

<style scoped>
.notification-content {
  display: flex;
  flex-direction: column;
}

.preview-box {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
