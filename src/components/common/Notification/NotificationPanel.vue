<template>
  <v-card class="notification-panel rounded-lg" elevation="1" min-width="380" max-width="420">
    <v-card-title class="d-flex justify-space-between align-center pa-4">
      <span class="text-h6 font-weight-medium">通知中心</span>
      <div class="d-flex align-center">
        <v-btn
          v-if="hasUnread"
          variant="text"
          density="comfortable"
          size="small"
          class="text-caption"
          @click="markAllAsRead"
        >
          标记全部已读
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-0" :style="{ maxHeight: '420px', overflowY: 'auto' }">
      <v-list v-if="notifications.length > 0" density="compact" lines="three" class="py-0">
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :active="!notification.read"
          :class="{ 'unread-notification': !notification.read }"
          class="notification-item py-2 px-4 transition-fast-in-fast-out"
        >
          <div class="d-flex align-start w-100">
            <v-avatar v-if="notification.sender" size="36" class="me-3 mt-1">
              <v-img v-if="notification.sender.avatarId" :src="getAvatarUrl(notification.sender.avatarId)" />
              <v-icon v-else icon="mdi-account" />
            </v-avatar>
            <v-avatar v-else size="36" class="me-3 mt-1" color="primary" variant="tonal">
              <v-icon :icon="getNotificationIcon(notification.type)" size="18" color="primary"></v-icon>
            </v-avatar>

            <div class="flex-grow-1 d-flex flex-column">
              <div class="d-flex flex-row justify-space-between align-center">
                <span class="text-subtitle-2 font-weight-medium text-high-emphasis">{{ notification.title }}</span>
                <span class="text-caption text-medium-emphasis ms-2">{{ formatTime(notification.createdAt) }}</span>
              </div>
              <span class="text-body-2 text-medium-emphasis mt-1 notification-content">{{ notification.content }}</span>
              <div class="d-flex justify-end align-center mt-2">
                <v-btn
                  v-if="!notification.read"
                  variant="text"
                  density="comfortable"
                  size="small"
                  color="primary"
                  class="px-2"
                  @click="markAsRead([notification.id])"
                >
                  标记为已读
                </v-btn>
                <v-btn
                  variant="text"
                  density="comfortable"
                  size="small"
                  color="error"
                  class="px-2 ms-2"
                  @click="deleteNotification(notification.id)"
                >
                  删除
                </v-btn>
              </div>
            </div>
          </div>
        </v-list-item>
      </v-list>
      <div v-else class="d-flex flex-column align-center justify-center py-8">
        <v-icon icon="mdi-bell-off-outline" size="64" color="grey-lighten-1" class="mb-3"></v-icon>
        <span class="text-subtitle-1 text-medium-emphasis">暂无通知</span>
      </div>
    </v-card-text>

    <v-divider v-if="hasMore"></v-divider>

    <v-card-actions v-if="hasMore" class="d-flex justify-center pa-3">
      <v-btn variant="text" color="primary" block @click="loadMore">
        加载更多
        <v-icon icon="mdi-chevron-down" class="ms-1"></v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Notification, NotificationType } from '@/network/api/notifications/types'

import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { getAvatarUrl } from '@/utils/materials'

import { NotificationsApi } from '@/network/api/notifications'
import AccountService from '@/services/account'

// 配置dayjs
dayjs.extend(relativeTime)
// 设置中文语言
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const props = defineProps<{
  onClose?: () => void
}>()

const emit = defineEmits<{
  (e: 'update-count', count: number): void
}>()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const pageStart = ref(0)
const pageSize = ref(10)
const hasMore = ref(false)

const currentUser = computed(() => AccountService._user.value)

const hasUnread = computed(() => notifications.value.some((notification) => !notification.read))

// 获取通知图标
const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'mention':
      return 'mdi-at'
    case 'reply':
      return 'mdi-reply'
    case 'reaction':
      return 'mdi-emoticon'
    case 'project_invite':
      return 'mdi-account-multiple-plus'
    case 'deadline_remind':
      return 'mdi-calendar-clock'
    default:
      return 'mdi-bell'
  }
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  return dayjs(timestamp).fromNow()
}

// 获取通知列表
const fetchNotifications = async () => {
  if (loading.value || !currentUser.value) return

  loading.value = true
  try {
    const { data } = await NotificationsApi.list({
      page_start: pageStart.value,
      page_size: pageSize.value,
    })

    notifications.value = [...notifications.value, ...data.notifications]
    hasMore.value = data.page.has_more
    pageStart.value += data.notifications.length
  } catch (error) {
    console.error('获取通知失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载更多通知
const loadMore = () => {
  fetchNotifications()
}

// 标记通知为已读
const markAsRead = async (notificationIds: number[]) => {
  if (!notificationIds.length) return

  try {
    await NotificationsApi.markAsRead({ notificationIds })

    // 更新本地通知状态
    notificationIds.forEach((id) => {
      const notification = notifications.value.find((n) => n.id === id)
      if (notification) {
        notification.read = true
      }
    })

    // 更新未读数量
    fetchUnreadCount()
  } catch (error) {
    console.error('标记通知已读失败:', error)
  }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  const unreadIds = notifications.value.filter((n) => !n.read).map((n) => n.id)
  if (unreadIds.length) {
    await markAsRead(unreadIds)
  }
}

// 删除通知
const deleteNotification = async (notificationId: number) => {
  try {
    await NotificationsApi.del(notificationId)

    // 从列表中移除
    notifications.value = notifications.value.filter((n) => n.id !== notificationId)

    // 更新未读数量
    fetchUnreadCount()
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

// 获取未读通知数量
const fetchUnreadCount = async () => {
  if (!currentUser.value?.id) return

  try {
    const response = await NotificationsApi.getUnreadCount(currentUser.value.id)
    emit('update-count', response.data.count)
  } catch (error) {
    console.error('获取未读通知数量失败:', error)
  }
}

// 初始化加载通知
onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notification-panel {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}

.notification-item {
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.unread-notification {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-left: 3px solid var(--v-theme-primary);
}

.notification-content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
