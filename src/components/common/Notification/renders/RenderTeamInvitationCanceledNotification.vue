<template>
  <div class="notification-content">
    <div class="text-subtitle-2 font-weight-medium">{{ title }}</div>
    <div class="text-body-2 text-medium-emphasis mt-1">{{ body }}</div>
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
const canceler = computed(() => getEntity(props.notification, 'canceler'))
const team = computed(() => getEntity(props.notification, 'team'))
const applicationId = computed(() => getStringMetadata(props.notification, 'applicationId', ''))

// 通知标题
const title = computed(() => {
  return t('notifications.TEAM_INVITATION_CANCELED.title')
})

// 通知内容
const body = computed(() => {
  return t('notifications.TEAM_INVITATION_CANCELED.body', {
    canceler: canceler.value?.name || t('notifications.common.teamAdmin'),
    team: team.value?.name || t('notifications.common.unknownTeam'),
  })
})

// 构建路由链接 - 可以导航到团队列表页面
const routerLink = computed(() => {
  return {
    name: 'TeamsIndex',
    params: {},
  }
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

.neutral-box {
  border-left: 3px solid rgba(var(--v-theme-on-surface), 0.2);
}
</style>
