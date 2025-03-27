import type {
  ListNotificationsParams,
  ListNotificationsResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
  UnreadCountResponse,
} from './types'

import { NewApiInstance } from '../index'

export namespace NotificationsApi {
  // 获取通知列表
  export const list = (params: ListNotificationsParams) =>
    NewApiInstance.request<ListNotificationsResponse>({
      url: '/notifications',
      method: 'GET',
      params,
    })

  // 删除通知
  export const del = (notificationId: number) =>
    NewApiInstance.request({
      url: `/notifications/${notificationId}`,
      method: 'DELETE',
    })

  // 标记通知为已读
  export const markAsRead = (data: MarkAsReadRequest) =>
    NewApiInstance.request<MarkAsReadResponse>({
      url: '/notifications/read',
      method: 'POST',
      data,
    })

  // 获取未读通知数量
  export const getUnreadCount = (receiverId: number) =>
    NewApiInstance.request<UnreadCountResponse>({
      url: '/notifications/unread/count',
      method: 'GET',
      params: { receiverId },
    })
}
