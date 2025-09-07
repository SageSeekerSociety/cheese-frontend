<template>
  <v-app-bar color="grey-lighten-5" :elevation="0" density="default" height="56" border="b-sm" app flat>
    <!-- 左侧抽屉按钮 -->
    <template #prepend>
      <v-app-bar-nav-icon @click="toggleDrawer" />
    </template>

    <!-- 中间标题 -->
    <v-app-bar-title>
      {{ currentTitle }}
    </v-app-bar-title>

    <!-- 右侧动态操作按钮 -->
    <template #append>
      <!-- 渲染动态 actions 组件 -->
      <component :is="actionsComponent" v-if="actionsComponent" />

      <!-- 通知按钮 -->
      <v-menu
        v-if="userMenu.loggedIn.value"
        v-model="notifications.notificationMenuOpen.value"
        :close-on-content-click="false"
        location="bottom"
        :offset="8"
        transition="scale-transition"
      >
        <template #activator="{ props }">
          <v-btn icon v-bind="props" variant="text">
            <v-icon>mdi-bell</v-icon>
            <v-badge
              v-if="notifications.unreadNotificationsCount.value > 0"
              color="error"
              :content="
                notifications.unreadNotificationsCount.value > 99
                  ? '99+'
                  : notifications.unreadNotificationsCount.value.toString()
              "
              floating
              dot
              :model-value="notifications.unreadNotificationsCount.value > 0"
            />
          </v-btn>
        </template>
        <notification-panel @update-count="notifications.updateUnreadCount" />
      </v-menu>

      <!-- 用户头像菜单 -->
      <v-menu
        v-if="userMenu.loggedIn.value"
        v-model="userMenu.menuOpen.value"
        open-on-click
        location="bottom start"
        :offset="8"
        transition="scale-transition"
      >
        <template #activator="{ props }">
          <v-btn icon v-bind="props" variant="text">
            <v-avatar size="28">
              <v-img v-if="userMenu.avatar.value" :src="userMenu.avatar.value" />
              <v-icon v-else icon="mdi-account" />
            </v-avatar>
          </v-btn>
        </template>

        <v-card class="user-menu-card rounded-lg elevation-1 border pa-0" min-width="300">
          <v-card-item class="user-header pa-4 pb-3">
            <v-avatar size="56" class="mb-2" elevation="1">
              <v-img v-if="userMenu.avatar.value" :src="userMenu.avatar.value" />
              <v-icon v-else icon="mdi-account" size="large" />
            </v-avatar>
            <div class="mt-2">
              <v-card-title class="px-0 py-0 text-h6 font-weight-bold">{{ userMenu.nickname.value }}</v-card-title>
              <v-card-subtitle class="px-0 pt-1 pb-0 text-body-2 text-medium-emphasis text-truncate" max-width="220">
                {{ userMenu.intro.value || '还没有个人简介' }}
              </v-card-subtitle>
            </div>
            <div class="d-flex mt-2">
              <v-chip prepend-icon="mdi-account" color="primary" variant="outlined" density="comfortable" size="small">
                UID: {{ userMenu.currentUser.value?.id }}
              </v-chip>
            </div>
          </v-card-item>

          <v-divider></v-divider>

          <v-card-text class="px-4 py-4">
            <v-card variant="tonal" color="primary" class="ai-quota-card rounded-lg mb-3" elevation="0">
              <v-card-text class="pa-3">
                <div class="d-flex align-center mb-2">
                  <v-avatar color="white" size="28" class="me-2">
                    <v-icon icon="mdi-creation" color="primary" size="small"></v-icon>
                  </v-avatar>
                  <span class="text-subtitle-2 font-weight-medium">知启星 AI</span>
                </div>

                <div class="d-flex justify-space-between align-center text-body-2 mb-2">
                  <span>今日剩余额度</span>
                  <span class="font-weight-medium">
                    {{ userMenu.aiQuota.value?.remaining ?? '-' }}/{{ userMenu.aiQuota.value?.total ?? '-' }}
                  </span>
                </div>

                <v-progress-linear
                  :model-value="
                    userMenu.aiQuota.value ? (userMenu.aiQuota.value.remaining / userMenu.aiQuota.value.total) * 100 : 0
                  "
                  color="primary"
                  bg-color="primary-lighten-5"
                  height="4"
                  rounded
                ></v-progress-linear>

                <div class="text-caption mt-1">
                  将在
                  {{ userMenu.aiQuota.value ? userMenu.dayjs(userMenu.aiQuota.value.reset_time).fromNow() : '-' }} 重置
                </div>
              </v-card-text>
            </v-card>

            <v-list class="user-menu-list pa-0" rounded="lg" elevation="0">
              <v-list-item
                :to="{ name: 'UserDefault', params: { id: userMenu.currentUser.value?.id } }"
                rounded="lg"
                class="mb-1"
                color="primary"
              >
                <template #prepend>
                  <v-icon icon="mdi-account" class="me-2"></v-icon>
                </template>
                <v-list-item-title>个人中心</v-list-item-title>
              </v-list-item>
              <v-list-item rounded="lg" color="error" @click="userMenu.onLogout">
                <template #prepend>
                  <v-icon icon="mdi-exit-to-app" class="me-2"></v-icon>
                </template>
                <v-list-item-title>退出登录</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-menu>

      <!-- 未登录时的登录按钮 -->
      <v-btn v-else to="/account/signin" variant="text" prepend-icon="mdi-account">登录</v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useNotifications } from '@/composables/useNotifications'
import { usePageTitle } from '@/composables/usePageTitle'
import { useUserMenu } from '@/composables/useUserMenu'

import NotificationPanel from '../Notification/NotificationPanel.vue'

import { useNavigationStore } from '@/stores/navigation'
import { usePageTitleStore } from '@/stores/title'

// 使用 composables
const userMenu = useUserMenu()
const notifications = useNotifications()

const navigationStore = useNavigationStore()
const { updateTrigger } = usePageTitleStore()
const { getRouteHierarchy } = usePageTitle()
const { actionsComponent } = storeToRefs(navigationStore)

const currentTitle = ref('知是社区')

// 切换抽屉状态
const toggleDrawer = () => {
  navigationStore.toggleSecondaryDrawer()
}

// 更新标题
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
</script>

<style lang="scss" scoped>
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

.ai-quota-card {
  transition: all 0.2s ease;
  overflow: hidden;
}
</style>
