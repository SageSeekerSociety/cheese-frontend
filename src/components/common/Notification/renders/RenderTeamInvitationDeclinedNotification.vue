<template>
  <div class="notification-content">
    <div class="text-subtitle-2 font-weight-medium">{{ title }}</div>
    <div class="text-body-2 text-medium-emphasis mt-1">{{ body }}</div>
    <div v-if="declineReason" class="text-body-2 text-medium-emphasis mt-2 message-box">
      <div class="text-caption mb-1">{{ t('notifications.common.reason') }}:</div>
      <div class="reason-text">{{ declineReason }}</div>
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
const decliner = computed(() => getEntity(props.notification, 'decliner'))
const team = computed(() => getEntity(props.notification, 'team'))
const declineReason = computed(() => getStringMetadata(props.notification, 'reason', ''))
const applicationId = computed(() => getStringMetadata(props.notification, 'applicationId', ''))

// 通知标题
const title = computed(() => {
  if (!decliner.value) return t('notifications.TEAM_INVITATION_DECLINED.title_anonymous')
  return t('notifications.TEAM_INVITATION_DECLINED.title', { decliner: decliner.value.name })
})

// 通知内容
const body = computed(() => {
  return t('notifications.TEAM_INVITATION_DECLINED.body', {
    team: team.value?.name || t('notifications.common.unknownTeam'),
  })
})

// 构建路由链接
const routerLink = computed(() => {
  if (team.value) {
    return {
      name: 'TeamsDetailMembers',
      params: { teamId: team.value.id },
      query: { tab: 'invitations' },
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

.error-box {
  border-left: 3px solid var(--v-theme-error);
}

.message-box {
  background-color: rgba(var(--v-theme-surface-variant), 0.7);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  position: relative;
}

.reason-text {
  font-style: italic;
}
</style>
