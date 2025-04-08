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

import { buildEntityLink, getEntity, getStringMetadata } from './NotificationRenderUtils'

import { TeamsApi } from '@/network/api/teams'

const props = defineProps<NotificationRenderProps>()
const emit = defineEmits<{
  (e: 'update-notification', notificationId: number): void
}>()
const { t } = useI18n()

// 获取实体和元数据
const inviter = computed(() => getEntity(props.notification, 'inviter'))
const team = computed(() => getEntity(props.notification, 'team'))
const role = computed(() => getStringMetadata(props.notification, 'role', '成员'))
const message = computed(() => getStringMetadata(props.notification, 'message', ''))
const applicationId = computed(() => getStringMetadata(props.notification, 'applicationId', ''))

// 通知标题
const title = computed(() => {
  if (!inviter.value) return t('notifications.TEAM_INVITATION.title_anonymous', { team: team.value?.name || '' })
  return t('notifications.TEAM_INVITATION.title', { inviter: inviter.value.name, team: team.value?.name || '' })
})

// 通知内容
const body = computed(() => {
  return t('notifications.TEAM_INVITATION.body', {
    role: role.value,
    team: team.value?.name || t('notifications.common.unknownTeam'),
  })
})

// 构建路由链接
const routerLink = computed(() => {
  // 如果有applicationId且状态为PENDING，则不提供路由链接，强制使用按钮操作
  if (applicationId.value && getStringMetadata(props.notification, 'status', '') === 'PENDING') {
    return undefined
  }

  // 否则才提供路由链接
  if (team.value) {
    return {
      name: 'TeamsDetailMembers',
      params: { teamId: team.value.id },
      query: {
        tab: 'invitations',
        applicationId: applicationId.value || undefined,
        type: 'invitation',
      },
    }
  }
  return undefined
})

// 自定义操作按钮
const actions = computed(() => {
  if (applicationId.value) {
    const actionButtons = [
      {
        text: t('notifications.TEAM_INVITATION.action.accept'),
        color: 'success',
        handler: async () => {
          try {
            await TeamsApi.acceptInvitation(Number(applicationId.value))
            toast.success('已接受邀请')
            // 通知父组件更新通知状态
            if (props.notification && props.notification.id) {
              emit('update-notification', props.notification.id)
            }
          } catch (error) {
            console.error('接受邀请失败:', error)
            toast.error('接受邀请失败，请稍后再试')
          }
        },
      },
      {
        text: t('notifications.TEAM_INVITATION.action.decline'),
        color: 'error',
        handler: async () => {
          try {
            await TeamsApi.declineInvitation(Number(applicationId.value))
            toast.success('已拒绝邀请')
            // 通知父组件更新通知状态
            if (props.notification && props.notification.id) {
              emit('update-notification', props.notification.id)
            }
          } catch (error) {
            console.error('拒绝邀请失败:', error)
            toast.error('拒绝邀请失败，请稍后再试')
          }
        },
      },
    ]
    return actionButtons
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
