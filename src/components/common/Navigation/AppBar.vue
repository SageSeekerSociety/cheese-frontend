<template>
  <v-system-bar window color="grey-lighten-5" absolute>
    <div class="position-absolute text-caption font-weight-bold title-bar w-100">
      <span class="text-caption">{{ currentTitle }}</span>
    </div>
    <div class="position-relative d-flex align-center justify-center">
      <v-spacer></v-spacer>
      <v-menu
        v-if="loggedIn"
        v-model="notificationMenuOpen"
        :close-on-content-click="false"
        location="bottom"
        :offset="16"
        transition="scale-transition"
      >
        <template #activator="{ props }">
          <v-btn icon position="relative" v-bind="props" color="text" size="x-small" variant="plain">
            <v-icon size="20">mdi-bell</v-icon>
            <v-badge
              v-if="unreadNotificationsCount > 0"
              color="error"
              :content="unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount.toString()"
              floating
              dot
              :model-value="unreadNotificationsCount > 0"
            ></v-badge>
          </v-btn>
        </template>
        <notification-panel @update-count="updateUnreadCount" />
      </v-menu>
      <v-btn v-else icon class="me-4" disabled>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
    </div>
  </v-system-bar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { usePageTitle } from '@/composables/usePageTitle'

import NotificationPanel from '../Notification/NotificationPanel.vue'

import { NotificationsApi } from '@/network/api/notifications'
import AccountService from '@/services/account'
import { usePageTitleStore } from '@/stores/title'

const router = useRouter()
const { updateTrigger } = usePageTitleStore()
const { getRouteHierarchy } = usePageTitle()

const notificationMenuOpen = ref(false)
const unreadNotificationsCount = ref(0)

const currentTitle = ref('知是社区')

const updateTitle = () => {
  const hierarchy = getRouteHierarchy.value
  for (const item of hierarchy) {
    if (item.meta.isFullPage) {
      currentTitle.value = item.title
      return
    }
  }
  currentTitle.value = '知是社区'
}

watch([getRouteHierarchy, () => updateTrigger], updateTitle, { immediate: true })

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    notificationMenuOpen.value = false
  }
)

const loggedIn = computed(() => AccountService._loggedIn.value)

// 获取未读通知数量
const fetchUnreadNotificationsCount = async () => {
  if (!loggedIn.value) return

  try {
    const response = await NotificationsApi.getUnreadCount()
    unreadNotificationsCount.value = response.data.count
  } catch (error) {
    console.error('获取未读通知数量失败:', error)
  }
}

// 更新未读通知数量
const updateUnreadCount = (count: number) => {
  unreadNotificationsCount.value = count
}

watch(loggedIn, (newValue) => {
  if (newValue) {
    fetchUnreadNotificationsCount()
  } else {
    unreadNotificationsCount.value = 0
  }
})

onMounted(() => {
  if (loggedIn.value) {
    fetchUnreadNotificationsCount()
  }
})
</script>

<style>
.app-bar-title {
  user-select: none;
}

.title-bar {
  height: 100%;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.floating-search-container {
  float: left;
}

.user-menu-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.user-menu-list .v-list-item {
  transition: all 0.2s ease;
  min-height: 44px;
}

.user-menu-list .v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.cursor-pointer {
  cursor: pointer;
}

.primary-gradient {
  background: linear-gradient(135deg, var(--v-theme-primary), var(--v-theme-primary-darken-1));
}

.ai-quota-card {
  transition: all 0.2s ease;
  overflow: hidden;
}
</style>
