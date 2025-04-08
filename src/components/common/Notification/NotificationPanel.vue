<template>
  <v-card class="notification-panel rounded-lg" elevation="1" min-width="380" max-width="420">
    <v-card-title class="d-flex justify-space-between align-center pa-4">
      <span class="text-h6 font-weight-medium">{{ t('notifications.common.notificationCenter') }}</span>
      <div class="d-flex align-center">
        <v-btn
          v-if="hasUnread"
          variant="text"
          density="comfortable"
          size="small"
          class="text-caption"
          @click="markAllAsRead"
        >
          {{ t('notifications.common.markAllAsRead') }}
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-0 notification-list-container" :style="{ maxHeight: '420px', overflowY: 'auto' }">
      <v-list v-if="notifications.length > 0" density="compact" lines="three" class="py-0">
        <notification-item
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          :on-mark-as-read="markAsRead"
          :on-delete="deleteNotification"
        />
      </v-list>
      <div v-else class="d-flex flex-column align-center justify-center py-8">
        <v-icon icon="mdi-bell-off-outline" size="64" color="grey-lighten-1" class="mb-3"></v-icon>
        <span class="text-subtitle-1 text-medium-emphasis">{{ t('notifications.common.noNotifications') }}</span>
      </div>
    </v-card-text>

    <v-divider v-if="hasMore"></v-divider>

    <v-card-actions v-if="hasMore" class="d-flex justify-center pa-3">
      <v-btn variant="text" color="primary" block :loading="loading" @click="loadMore">
        {{ t('notifications.common.loadMore') }}
        <v-icon icon="mdi-chevron-down" class="ms-1"></v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Notification } from '@/network/api/notifications/types'

import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import NotificationItem from './NotificationItem.vue'

import { NotificationsApi } from '@/network/api/notifications'

const { t } = useI18n()

const props = defineProps<{
  onClose?: () => void
}>()

const emit = defineEmits<{
  (e: 'update-count', count: number): void
}>()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const cursorStart = ref<string | undefined>(undefined)
const pageSize = ref(10)
const hasMore = ref(false)

// 判断是否有未读通知
const hasUnread = computed(() => notifications.value.some((notification) => !notification.read))

// 获取通知列表
const fetchNotifications = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const { data } = await NotificationsApi.list({
      pageStart: cursorStart.value,
      pageSize: pageSize.value,
    })

    notifications.value = [...notifications.value, ...data.notifications]
    hasMore.value = data.page.hasMore
    cursorStart.value = data.page.nextStart
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

// 标记单个通知为已读
const markAsRead = async (notificationId: number) => {
  try {
    await NotificationsApi.updateStatus(notificationId, true)

    // 更新本地通知状态
    const notification = notifications.value.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
    }

    // 更新未读数量
    fetchUnreadCount()
  } catch (error) {
    console.error('标记通知已读失败:', error)
  }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    await NotificationsApi.markAllAsRead()

    // 更新本地通知状态
    notifications.value.forEach((notification) => {
      notification.read = true
    })

    // 更新未读数量
    fetchUnreadCount()
  } catch (error) {
    console.error('标记所有通知已读失败:', error)
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
  try {
    const response = await NotificationsApi.getUnreadCount()
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

.notification-list-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.1) transparent;
}

.notification-list-container::-webkit-scrollbar {
  width: 6px;
}

.notification-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 6px;
}

.notification-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.15);
}
</style>
