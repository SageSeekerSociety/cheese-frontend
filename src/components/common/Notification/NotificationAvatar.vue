<template>
  <v-avatar :size="size" :color="avatarColor" :variant="variant">
    <!-- 如果有主要实体并且有头像，显示实体头像 -->
    <v-img v-if="primaryEntityWithAvatar" :src="primaryEntityWithAvatar.avatarUrl" />
    <!-- 否则显示图标 -->
    <v-icon v-else :icon="icon" :size="iconSize" :color="iconColor"></v-icon>
  </v-avatar>
</template>

<script setup lang="ts">
import type { Notification } from '@/network/api/notifications/types'
import type { EntityInfo } from '@/network/api/notifications/types'

import { computed } from 'vue'

import { getNotificationColor, getNotificationIcon } from '@/services/notification/registry'

const props = defineProps<{
  notification: Notification
  size?: number | string
  color?: string
}>()

// 默认头像大小
const size = computed(() => props.size || 36)

// 图标大小
const iconSize = computed(() => {
  const avatarSize = typeof props.size === 'number' ? props.size : parseInt(props.size as string, 10)
  return isNaN(avatarSize) ? 18 : Math.max(Math.floor(avatarSize / 2), 16)
})

// 获取通知图标
const icon = computed(() => getNotificationIcon(props.notification.type))

// 获取通知颜色
const color = computed(() => props.color || getNotificationColor(props.notification.type))

// 获取主要实体（优先级：发送者 > 其他人类实体）
const primaryEntityWithAvatar = computed<EntityInfo | null>(() => {
  const { entities } = props.notification
  const possibleRoles = [
    'sender',
    'mentioner',
    'replier',
    'reactor',
    'inviter',
    'requester',
    'approver',
    'rejector',
    'accepter',
    'decliner',
    'canceler',
  ]

  // 遍历可能的角色，找到第一个有头像的实体
  for (const role of possibleRoles) {
    const entity = entities[role]
    if (entity && entity.avatarUrl) {
      return entity
    }
  }

  // 如果没有发送者或发送者没有头像，查找其他实体
  for (const [role, entity] of Object.entries(entities)) {
    if (entity && entity.avatarUrl && entity.type === 'user') {
      return entity
    }
  }

  return null
})

// 头像颜色
const avatarColor = computed(() => {
  return primaryEntityWithAvatar.value ? undefined : color.value
})

// 头像变体
const variant = computed(() => {
  return primaryEntityWithAvatar.value ? undefined : 'tonal'
})

// 图标颜色
const iconColor = computed(() => {
  return color.value
})
</script>
