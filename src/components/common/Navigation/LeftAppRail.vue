<template>
  <v-navigation-drawer permanent rail :rail-width="64" class="app-rail pb-2" color="grey-lighten-5" border="none">
    <!-- <v-avatar v-tooltip="'知是'" :image="logo" size="48" /> -->
    <RailItem v-for="item in showItems" :key="item.key" :item="item"></RailItem>
    <v-spacer></v-spacer>
    <v-menu
      v-if="userMenu.loggedIn.value"
      v-model="userMenu.menuOpen.value"
      open-on-click
      location="top start"
      :offset="16"
      transition="scale-transition"
    >
      <template #activator="{ props }">
        <v-avatar v-tooltip="userMenu.nickname.value" class="cursor-pointer elevation-1 mb-4" size="32" v-bind="props">
          <v-img v-if="userMenu.avatar.value" :src="userMenu.avatar.value" />
          <v-icon v-else icon="mdi-account" />
        </v-avatar>
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
    <v-btn v-else to="/account/signin" variant="tonal" color="primary" prepend-icon="mdi-account">登录</v-btn>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

import { useUserMenu } from '@/composables/useUserMenu'

import RailItem from './RailItem.vue'
import { NavBarProps } from './types'

import logo from '@/assets/logo.svg?url'

const navBarProps = withDefaults(defineProps<NavBarProps>(), {
  items: () => [],
})

const { items } = toRefs(navBarProps)

const showItems = computed(() => {
  return items.value.filter((item) => item.type !== 'item' || item.visibleOnPC !== false)
})

// 使用用户菜单 composable
const userMenu = useUserMenu()
</script>

<style lang="scss">
.app-rail {
  .v-navigation-drawer__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
  }
}

.logo {
  width: 48px;
  height: 48px;
}
</style>
