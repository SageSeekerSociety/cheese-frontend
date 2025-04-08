import type { User } from '@/types'

export type NotificationType =
  | 'MENTION'
  | 'REPLY'
  | 'REACTION'
  | 'PROJECT_INVITE'
  | 'DEADLINE_REMIND'
  | 'TEAM_JOIN_REQUEST'
  | 'TEAM_INVITATION'
  | 'TEAM_REQUEST_APPROVED'
  | 'TEAM_REQUEST_REJECTED'
  | 'TEAM_INVITATION_ACCEPTED'
  | 'TEAM_INVITATION_DECLINED'
  | 'TEAM_INVITATION_CANCELED'
  | 'TEAM_REQUEST_CANCELED'

export interface EntityInfo {
  id: string
  type: string
  name: string
  avatarUrl?: string
}

export interface Notification {
  id: number
  type: NotificationType
  read: boolean
  createdAt: number
  updatedAt?: number
  entities: Record<string, EntityInfo | null>
  contextMetadata: Record<string, any>
}

export interface EncodedCursorPage {
  pageStart: string
  pageSize: number
  has_prev: boolean
  hasMore: boolean
  nextStart?: string
  total?: number
}

export interface ListNotificationsParams {
  type?: NotificationType
  read?: boolean
  pageStart?: string
  pageSize: number
}

export interface ListNotificationsResponse {
  notifications: Notification[]
  page: EncodedCursorPage
}

export interface NotificationUpdate {
  id: number
  read: boolean
}

export interface BulkUpdateRequest {
  updates: NotificationUpdate[]
}

export interface BulkUpdateResponse {
  updatedIds: number[]
}

export interface MarkAllAsReadRequest {
  read: boolean
}

export interface MarkAllAsReadResponse {
  count: number
}

export interface UnreadCountResponse {
  count: number
}
