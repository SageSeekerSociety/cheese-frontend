<template>
  <div class="notification-content">
    <div class="text-subtitle-2 font-weight-medium">{{ title }}</div>
    <div class="text-body-2 text-medium-emphasis mt-1">{{ body }}</div>
    <div v-if="message" class="text-body-2 text-medium-emphasis mt-2 message-box">
      <v-icon icon="mdi-format-quote-open" size="12" class="me-1 text-primary-lighten-1" />
      {{ message }}
      <v-icon icon="mdi-format-quote-close" size="12" class="ms-1 text-primary-lighten-1" />
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
const inviter = computed(() => getEntity(props.notification, 'inviter'))
const project = computed(() => getEntity(props.notification, 'project'))
const projectName = computed(() => getStringMetadata(props.notification, 'projectName', project.value?.name || ''))
const role = computed(() => getStringMetadata(props.notification, 'role', '成员'))
const message = computed(() => getStringMetadata(props.notification, 'message', ''))
const invitationId = computed(() => getStringMetadata(props.notification, 'invitationId', ''))

// 通知标题
const title = computed(() => {
  if (!inviter.value) return t('notifications.PROJECT_INVITE.title_anonymous')
  return t('notifications.PROJECT_INVITE.title', { inviter: inviter.value.name })
})

// 通知内容
const body = computed(() => {
  return t('notifications.PROJECT_INVITE.body', {
    projectName: projectName.value || t('notifications.common.unknownProject'),
  })
})

// 构建路由链接
const routerLink = computed(() => {
  if (project.value) {
    return {
      name: 'ProjectInvitations',
      params: { id: project.value.id },
      query: invitationId.value ? { invitationId: invitationId.value } : undefined,
    }
  }
  return undefined
})

// 自定义操作按钮
const actions = computed(() => {
  if (invitationId.value) {
    return [
      {
        text: t('notifications.PROJECT_INVITE.action.accept'),
        color: 'success',
        handler: () => {
          console.log('Accept project invitation:', invitationId.value)
          // 这里可以实现接受邀请的逻辑
        },
      },
      {
        text: t('notifications.PROJECT_INVITE.action.decline'),
        color: 'error',
        handler: () => {
          console.log('Decline project invitation:', invitationId.value)
          // 这里可以实现拒绝邀请的逻辑
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

.message-box {
  background-color: rgba(var(--v-theme-surface-variant), 0.7);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  font-style: italic;
  position: relative;
}
</style>
