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
import { toast } from 'vuetify-sonner'

import { getEntity, getStringMetadata } from './NotificationRenderUtils'

import { TeamsApi } from '@/network/api/teams'

const props = defineProps<NotificationRenderProps>()
const emit = defineEmits<{
  (e: 'update-notification', notificationId: number): void
}>()
const { t } = useI18n()

const requester = computed(() => getEntity(props.notification, 'requester'))
const team = computed(() => getEntity(props.notification, 'team'))
const message = computed(() => getStringMetadata(props.notification, 'message', ''))
const applicationId = computed(() => getStringMetadata(props.notification, 'applicationId', ''))

const title = computed(() => {
  if (!requester.value) return t('notifications.TEAM_JOIN_REQUEST.title_anonymous')
  return t('notifications.TEAM_JOIN_REQUEST.title', { requester: requester.value.name })
})

const body = computed(() => {
  return t('notifications.TEAM_JOIN_REQUEST.body', {
    team: team.value?.name || t('notifications.common.unknownTeam'),
  })
})

const routerLink = computed(() => {
  // 如果有申请ID且状态为PENDING，则不提供路由链接，强制使用按钮操作
  if (applicationId.value && getStringMetadata(props.notification, 'status', '') === 'PENDING') {
    return undefined
  }

  // 否则才提供路由链接（比如已处理的申请）
  if (team.value) {
    return {
      name: 'TeamsDetailMembers',
      params: { teamId: team.value.id },
      query: {
        tab: 'requests',
        applicationId: applicationId.value || undefined,
        type: 'request',
      },
    }
  }
  return undefined
})

const actions = computed(() => {
  if (applicationId.value && team.value) {
    return [
      {
        text: t('notifications.TEAM_JOIN_REQUEST.action.approve'),
        color: 'success',
        handler: async () => {
          try {
            if (!team.value) return
            await TeamsApi.approveJoinRequest(Number(team.value.id), Number(applicationId.value))
            toast.success('已批准申请')
            // 通知父组件更新通知状态
            if (props.notification && props.notification.id) {
              emit('update-notification', props.notification.id)
            }
          } catch (error) {
            console.error('批准申请失败:', error)
            toast.error('批准申请失败，请稍后再试')
          }
        },
      },
      {
        text: t('notifications.TEAM_JOIN_REQUEST.action.reject'),
        color: 'error',
        handler: async () => {
          try {
            if (!team.value) return
            await TeamsApi.rejectJoinRequest(Number(team.value.id), Number(applicationId.value))
            toast.success('已拒绝申请')
            // 通知父组件更新通知状态
            if (props.notification && props.notification.id) {
              emit('update-notification', props.notification.id)
            }
          } catch (error) {
            console.error('拒绝申请失败:', error)
            toast.error('拒绝申请失败，请稍后再试')
          }
        },
      },
    ]
  }
  return []
})

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
  background-color: rgba(var(--v-theme-surface-variant), 0.15);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  font-style: italic;
  position: relative;
}
</style>
