import type { Page, User } from '@/types'

export type NotificationType = 'mention' | 'reply' | 'reaction' | 'project_invite' | 'deadline_remind'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  content: string
  sender?: User
  read: boolean
  resourceType: string
  resourceId: number
  createdAt: number
  updatedAt: number
}

export interface ListNotificationsParams {
  type?: NotificationType
  read?: boolean
  page_start: number
  page_size: number
}

export interface ListNotificationsResponse {
  notifications: Notification[]
  page: Page
}

export interface MarkAsReadRequest {
  notificationIds: number[]
}

export interface MarkAsReadResponse {
  notificationIds: number[]
}

export interface UnreadCountResponse {
  count: number
}
