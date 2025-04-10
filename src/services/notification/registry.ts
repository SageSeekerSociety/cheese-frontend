import type { Component } from 'vue'
import type { NotificationType } from '@/network/api/notifications/types'

import RenderDeadlineRemindNotification from '@/components/common/Notification/renders/RenderDeadlineRemindNotification.vue'
import RenderDefaultNotification from '@/components/common/Notification/renders/RenderDefaultNotification.vue'
// 导入渲染组件
import RenderMentionNotification from '@/components/common/Notification/renders/RenderMentionNotification.vue'
import RenderProjectInviteNotification from '@/components/common/Notification/renders/RenderProjectInviteNotification.vue'
import RenderReactionNotification from '@/components/common/Notification/renders/RenderReactionNotification.vue'
import RenderReplyNotification from '@/components/common/Notification/renders/RenderReplyNotification.vue'
import RenderTeamInvitationAcceptedNotification from '@/components/common/Notification/renders/RenderTeamInvitationAcceptedNotification.vue'
import RenderTeamInvitationCanceledNotification from '@/components/common/Notification/renders/RenderTeamInvitationCanceledNotification.vue'
import RenderTeamInvitationDeclinedNotification from '@/components/common/Notification/renders/RenderTeamInvitationDeclinedNotification.vue'
import RenderTeamInvitationNotification from '@/components/common/Notification/renders/RenderTeamInvitationNotification.vue'
import RenderTeamJoinRequestNotification from '@/components/common/Notification/renders/RenderTeamJoinRequestNotification.vue'
import RenderTeamRequestApprovedNotification from '@/components/common/Notification/renders/RenderTeamRequestApprovedNotification.vue'
import RenderTeamRequestCanceledNotification from '@/components/common/Notification/renders/RenderTeamRequestCanceledNotification.vue'
import RenderTeamRequestRejectedNotification from '@/components/common/Notification/renders/RenderTeamRequestRejectedNotification.vue'

// 通知类型到渲染组件的映射
const notificationRendererRegistry: Record<NotificationType, Component> = {
  MENTION: RenderMentionNotification,
  REPLY: RenderReplyNotification,
  REACTION: RenderReactionNotification,
  PROJECT_INVITE: RenderProjectInviteNotification,
  DEADLINE_REMIND: RenderDeadlineRemindNotification,
  TEAM_JOIN_REQUEST: RenderTeamJoinRequestNotification,
  TEAM_INVITATION: RenderTeamInvitationNotification,
  TEAM_REQUEST_APPROVED: RenderTeamRequestApprovedNotification,
  TEAM_REQUEST_REJECTED: RenderTeamRequestRejectedNotification,
  TEAM_INVITATION_ACCEPTED: RenderTeamInvitationAcceptedNotification,
  TEAM_INVITATION_DECLINED: RenderTeamInvitationDeclinedNotification,
  TEAM_INVITATION_CANCELED: RenderTeamInvitationCanceledNotification,
  TEAM_REQUEST_CANCELED: RenderTeamRequestCanceledNotification,
}

/**
 * 根据通知类型获取对应的渲染组件
 * @param type 通知类型
 * @returns 对应的渲染组件，如果找不到则返回默认组件
 */
export function getNotificationRenderer(type: NotificationType): Component {
  return notificationRendererRegistry[type] || RenderDefaultNotification
}

/**
 * 获取通知图标
 * @param type 通知类型
 * @returns 对应的图标名称
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'MENTION':
      return 'mdi-at'
    case 'REPLY':
      return 'mdi-reply'
    case 'REACTION':
      return 'mdi-emoticon'
    case 'PROJECT_INVITE':
      return 'mdi-account-multiple-plus'
    case 'DEADLINE_REMIND':
      return 'mdi-calendar-clock'
    case 'TEAM_JOIN_REQUEST':
      return 'mdi-account-question'
    case 'TEAM_INVITATION':
      return 'mdi-account-multiple-plus'
    case 'TEAM_REQUEST_APPROVED':
      return 'mdi-check-circle'
    case 'TEAM_REQUEST_REJECTED':
      return 'mdi-close-circle'
    case 'TEAM_INVITATION_ACCEPTED':
      return 'mdi-check-circle'
    case 'TEAM_INVITATION_DECLINED':
      return 'mdi-close-circle'
    case 'TEAM_INVITATION_CANCELED':
      return 'mdi-cancel'
    case 'TEAM_REQUEST_CANCELED':
      return 'mdi-cancel'
    default:
      return 'mdi-bell'
  }
}

/**
 * 获取通知颜色
 * @param type 通知类型
 * @returns 对应的颜色
 */
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'TEAM_REQUEST_APPROVED':
    case 'TEAM_INVITATION_ACCEPTED':
      return 'success'
    case 'TEAM_REQUEST_REJECTED':
    case 'TEAM_INVITATION_DECLINED':
    case 'TEAM_INVITATION_CANCELED':
    case 'TEAM_REQUEST_CANCELED':
      return 'error'
    case 'DEADLINE_REMIND':
      return 'warning'
    default:
      return 'primary'
  }
}
