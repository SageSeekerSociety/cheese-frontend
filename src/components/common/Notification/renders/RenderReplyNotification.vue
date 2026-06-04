<template>
  <div class="notification-content">
    <div class="text-subtitle-2 font-weight-medium">{{ title }}</div>
    <div class="text-body-2 text-medium-emphasis mt-1">{{ body }}</div>
    <div v-if="previewContent" class="text-body-2 text-medium-emphasis mt-2 preview-box">
      <v-icon icon="mdi-reply" size="14" class="me-1 text-medium-emphasis" />
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
const replier = computed(() => getEntity(props.notification, 'replier'))
const discussionTitle = computed(() => getStringMetadata(props.notification, 'discussionTitle', ''))
const discussionId = computed(() => getStringMetadata(props.notification, 'discussionId', ''))
const commentId = computed(() => getStringMetadata(props.notification, 'commentId', ''))
const previewContent = computed(() => getStringMetadata(props.notification, 'previewContent', ''))

// 通知标题
const title = computed(() => {
  if (!replier.value) return t('notifications.REPLY.title_anonymous')
  return t('notifications.REPLY.title', { replier: replier.value.name })
})

// 通知内容
const body = computed(() => {
  return t('notifications.REPLY.body', {
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

// 可选的自定义操作
const actions = computed(() => {
  // 如果回复内容可用且有评论ID，可以添加"回复"操作
  if (previewContent.value && commentId.value && discussionId.value) {
    return [
      {
        text: t('notifications.REPLY.action.reply'),
        color: 'primary',
        handler: () => {
          // 这里可以实现直接回复的功能
          // 例如，打开回复对话框或导航到特定页面
          console.log('Reply to comment:', commentId.value)
          window.open(`/discussions/${discussionId.value}?comment=${commentId.value}&reply=true`, '_blank')
        },
      },
    ]
  }
  return []
})

// 导出渲染结果，供父组件使用
const content = computed<RenderedNotificationContent>(() => ({
  title: title.value,
  body: body.value,
  routerLink: routerLink.value,
  actions: actions.value,
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
