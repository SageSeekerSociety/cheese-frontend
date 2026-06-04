import type { Notification } from '@/network/api/notifications/types'
import type { EntityInfo } from '@/network/api/notifications/types'

/**
 * 通知渲染组件的Props接口
 */
export interface NotificationRenderProps {
  notification: Notification
}

/**
 * 通知渲染结果的接口
 */
export interface RenderedNotificationContent {
  title: string
  body: string
  routerLink?: { name: string; params?: Record<string, any>; query?: Record<string, any> }
  actions?: Array<{
    text: string
    color?: string
    handler: () => void
  }>
}

/**
 * 从通知中提取实体信息
 * @param notification 通知对象
 * @param role 实体角色
 * @returns 实体信息，如果不存在则返回null
 */
export function getEntity(notification: Notification, role: string): EntityInfo | null {
  return notification.entities[role] || null
}

/**
 * 从通知中提取元数据
 * @param notification 通知对象
 * @param key 元数据键
 * @param defaultValue 默认值
 * @returns 元数据值，如果不存在则返回默认值
 */
export function getMetadata<T>(notification: Notification, key: string, defaultValue: T): T {
  const value = notification.contextMetadata[key]
  return value !== undefined ? (value as T) : defaultValue
}

/**
 * 从通知中提取字符串元数据
 * @param notification 通知对象
 * @param key 元数据键
 * @param defaultValue 默认值
 * @returns 元数据值，如果不存在则返回默认值
 */
export function getStringMetadata(notification: Notification, key: string, defaultValue: string = ''): string {
  const value = notification.contextMetadata[key]
  return value !== undefined ? String(value) : defaultValue
}

/**
 * 根据实体ID和类型构建路由链接
 * @param entityType 实体类型
 * @param entityId 实体ID
 * @param query 可选的查询参数
 * @returns 路由链接对象
 */
export function buildEntityLink(entityType: string, entityId: string, query?: Record<string, any>) {
  switch (entityType) {
    case 'user':
      return {
        name: 'UserDetail',
        params: { id: entityId },
        query,
      }
    case 'team':
      return {
        name: 'TeamDetail',
        params: { id: entityId },
        query,
      }
    case 'project':
      return {
        name: 'ProjectDetail',
        params: { id: entityId },
        query,
      }
    case 'discussion':
      return {
        name: 'DiscussionDetail',
        params: { id: entityId },
        query,
      }
    default:
      return undefined
  }
}
