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
const approver = computed(() => getEntity(props.notification, 'approver'))
const team = computed(() => getEntity(props.notification, 'team'))
const applicationId = computed(() => getStringMetadata(props.notification, 'applicationId', ''))

// 通知标题
const title = computed(() => {
  return t('notifications.TEAM_REQUEST_APPROVED.title')
})

// 通知内容
const body = computed(() => {
  return t('notifications.TEAM_REQUEST_APPROVED.body', {
    approver: approver.value?.name || t('notifications.common.teamAdmin'),
    team: team.value?.name || t('notifications.common.unknownTeam'),
  })
})

// 构建路由链接
const routerLink = computed(() => {
  if (team.value) {
    return {
      name: 'TeamsDetail',
      params: { teamId: team.value.id },
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

.success-box {
  border-left: 3px solid var(--v-theme-success);
}
</style>
