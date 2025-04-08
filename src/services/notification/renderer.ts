import type { Notification, NotificationType } from '@/network/api/notifications/types'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface NotificationRenderContext {
  notification: Notification
}

export interface RenderedNotification {
  title: string
  body: string
  icon: string
  color: string
  routerLink?: { name: string; params?: Record<string, any>; query?: Record<string, any> }
  action?: () => void
}

export function useNotificationRenderer() {
  const { t } = useI18n()

  // 获取通知图标
  const getNotificationIcon = (type: NotificationType): string => {
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

  // 获取通知颜色
  const getNotificationColor = (type: NotificationType): string => {
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

  // 获取渲染参数
  const getTemplateParams = (notification: Notification): Record<string, string> => {
    const params: Record<string, string> = {}

    // 处理实体信息
    Object.entries(notification.entities).forEach(([role, entity]) => {
      if (entity) {
        params[role] = entity.name
      } else {
        params[role] = t('common.deletedEntity')
      }
    })

    // 合并上下文元数据
    Object.entries(notification.contextMetadata).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        params[key] = String(value)
      }
    })

    return params
  }

  // 获取路由链接
  const getRouterLink = (notification: Notification) => {
    const { type, entities, contextMetadata } = notification

    // 根据通知类型和元数据构造路由链接
    switch (type) {
      case 'MENTION':
      case 'REPLY':
        if (contextMetadata.discussionId) {
          return {
            name: 'DiscussionDetail',
            params: { id: contextMetadata.discussionId },
            query: contextMetadata.commentId ? { comment: contextMetadata.commentId } : undefined,
          }
        }
        break
      case 'TEAM_INVITATION':
      case 'TEAM_REQUEST_APPROVED':
      case 'TEAM_REQUEST_REJECTED':
        if (entities.team?.id) {
          return {
            name: 'TeamDetail',
            params: { id: entities.team.id },
          }
        }
        break
      case 'TEAM_JOIN_REQUEST':
      case 'TEAM_INVITATION_ACCEPTED':
      case 'TEAM_INVITATION_DECLINED':
      case 'TEAM_INVITATION_CANCELED':
      case 'TEAM_REQUEST_CANCELED':
        if (entities.team?.id) {
          return {
            name: 'TeamMembers',
            params: { id: entities.team.id },
          }
        }
        break
      case 'PROJECT_INVITE':
        if (contextMetadata.projectId) {
          return {
            name: 'ProjectDetail',
            params: { id: contextMetadata.projectId },
          }
        }
        break
    }

    return undefined
  }

  // 渲染通知内容
  const renderNotification = (context: NotificationRenderContext): RenderedNotification => {
    const { notification } = context
    const { type } = notification

    // 获取模板参数
    const params = getTemplateParams(notification)

    // 渲染标题和内容
    const title = t(`notifications.${type}.title`, params)
    const body = t(`notifications.${type}.body`, params)

    // 获取图标和颜色
    const icon = getNotificationIcon(type)
    const color = getNotificationColor(type)

    // 获取路由链接
    const routerLink = getRouterLink(notification)

    return {
      title,
      body,
      icon,
      color,
      routerLink,
    }
  }

  return {
    renderNotification,
    getNotificationIcon,
    getNotificationColor,
  }
}
