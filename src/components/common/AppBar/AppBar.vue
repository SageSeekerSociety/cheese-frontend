<template>
  <v-app-bar app flat>
    <div class="position-relative flex-1-0">
      <v-container class="mx-auto d-flex align-center justify-center">
        <router-link :to="{ name: 'HomeDefault' }" class="text-decoration-none text-primary">
          <span class="text-h5 font-weight-bold me-4 app-bar-title d-flex align-center flex-row ga-2">
            <v-img :src="logo" width="32" height="32"></v-img>
            <span class="d-none d-md-inline">知是</span>
          </span>
        </router-link>
        <v-btn v-for="link in links" :key="link.key" :text="link.title" :to="link.path" variant="text"></v-btn>
        <v-spacer></v-spacer>
        <v-responsive max-width="240" class="me-4 d-none d-md-flex">
          <v-form disabled @submit.prevent="onSearchSubmit">
            <v-text-field
              v-model="searchInput"
              disabled
              density="compact"
              flat
              hide-details
              label="搜索"
              prepend-inner-icon="mdi-magnify"
              rounded="lg"
              single-line
              variant="solo-filled"
            ></v-text-field>
          </v-form>
        </v-responsive>
        <v-btn icon class="me-1 d-md-none" disabled @click="openFloatingSearch">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-menu
          v-if="loggedIn"
          v-model="notificationMenuOpen"
          :close-on-content-click="false"
          location="bottom"
          :offset="16"
          transition="scale-transition"
        >
          <template #activator="{ props }">
            <v-btn icon class="me-4 position-relative" v-bind="props">
              <v-icon>mdi-bell</v-icon>
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
        <v-menu
          v-if="loggedIn"
          v-model="menuOpen"
          open-on-hover
          open-on-click
          location="bottom center"
          :offset="16"
          transition="scale-transition"
        >
          <template #activator="{ props }">
            <v-avatar class="cursor-pointer elevation-1" size="32" v-bind="props">
              <v-img v-if="avatar" :src="avatar" />
              <v-icon v-else icon="mdi-account" />
            </v-avatar>
          </template>

          <v-card class="user-menu-card rounded-lg elevation-1 border pa-0" min-width="300">
            <v-card-item class="user-header pa-4 pb-3">
              <v-avatar size="56" class="mb-2" elevation="1">
                <v-img v-if="avatar" :src="avatar" />
                <v-icon v-else icon="mdi-account" size="large" />
              </v-avatar>
              <div class="mt-2">
                <v-card-title class="px-0 py-0 text-h6 font-weight-bold">{{ nickname }}</v-card-title>
                <v-card-subtitle class="px-0 pt-1 pb-0 text-body-2 text-medium-emphasis text-truncate" max-width="220">
                  {{ intro || '还没有个人简介' }}
                </v-card-subtitle>
              </div>
              <div class="d-flex mt-2">
                <v-chip
                  prepend-icon="mdi-account"
                  color="primary"
                  variant="outlined"
                  density="comfortable"
                  size="small"
                >
                  UID: {{ currentUser?.id }}
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
                      {{ aiQuota?.remaining ?? '-' }}/{{ aiQuota?.total ?? '-' }}
                    </span>
                  </div>

                  <v-progress-linear
                    :model-value="aiQuota ? (aiQuota.remaining / aiQuota.total) * 100 : 0"
                    color="primary"
                    bg-color="primary-lighten-5"
                    height="4"
                    rounded
                  ></v-progress-linear>

                  <div class="text-caption mt-1">
                    将在 {{ aiQuota ? dayjs(aiQuota.reset_time).fromNow() : '-' }} 重置
                  </div>
                </v-card-text>
              </v-card>

              <v-list class="user-menu-list pa-0" rounded="lg" elevation="0">
                <v-list-item
                  :to="{ name: 'UserDefault', params: { id: currentUser?.id } }"
                  rounded="lg"
                  class="mb-1"
                  color="primary"
                >
                  <template #prepend>
                    <v-icon icon="mdi-account" class="me-2"></v-icon>
                  </template>
                  <v-list-item-title>个人中心</v-list-item-title>
                </v-list-item>
                <v-list-item rounded="lg" color="error" @click="onLogout">
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
      </v-container>
      <v-slide-y-transition>
        <div
          v-if="floatingSearch"
          class="position-absolute top-0 bottom-0 left-0 right-0 w-100 bg-surface d-flex flex-row align-center ga-2 px-4 floating-search-container"
        >
          <v-form class="flex-grow-1" @submit.prevent="onSearchSubmit">
            <v-text-field
              v-model="searchInput"
              density="compact"
              flat
              hide-details
              label="搜索"
              prepend-inner-icon="mdi-magnify"
              rounded="lg"
              single-line
              variant="solo-filled"
              class="flex-grow-1"
            ></v-text-field>
          </v-form>
          <v-btn icon @click="closeFloatingSearch">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-slide-y-transition>
    </div>
    <template v-if="$slots.extension" #extension>
      <slot name="extension"></slot>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import type { QuotaInfo } from '@/network/api/ai/types'
import type { AppBarProps } from './types'

import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import NotificationPanel from '../Notification/NotificationPanel.vue'
import UserAvatar from '../UserAvatar.vue'

import logo from '@/assets/logo.svg?url'
import { AIApi } from '@/network/api/ai'
import { NotificationsApi } from '@/network/api/notifications'
import { UserApi } from '@/network/api/users'
import AccountService from '@/services/account'

const appBarProps = withDefaults(defineProps<AppBarProps>(), {
  links: () => [],
})

const { links } = toRefs(appBarProps)

const router = useRouter()

const menuOpen = ref(false)
const notificationMenuOpen = ref(false)
const unreadNotificationsCount = ref(0)

watch(menuOpen, (newValue) => {
  if (newValue) {
    fetchAIQuota()
  }
})

const searchInput = defineModel<string>('search')
const onSearchSubmit = () => {
  console.log(searchInput.value)
  router.push({ name: 'Search', query: { q: searchInput.value } })
}

const floatingSearch = ref(false)
const openFloatingSearch = () => {
  floatingSearch.value = true
}
const closeFloatingSearch = () => {
  floatingSearch.value = false
}

const loggedIn = computed(() => AccountService._loggedIn.value)
const currentUser = computed(() => AccountService._user.value)
const avatar = computed(() => getAvatarUrl(AccountService._user.value?.avatarId))
const nickname = computed(() => AccountService._user.value?.nickname ?? '')
const intro = computed(() => AccountService._user.value?.intro ?? '')

const aiQuota = ref<QuotaInfo | null>(null)

const fetchAIQuota = async () => {
  if (!loggedIn.value) return
  try {
    const { data } = await AIApi.getQuota()
    aiQuota.value = data
  } catch (error) {
    console.error('Failed to fetch AI quota:', error)
  }
}

// 获取未读通知数量
const fetchUnreadNotificationsCount = async () => {
  if (!loggedIn.value || !currentUser.value?.id) return

  try {
    const response = await NotificationsApi.getUnreadCount(currentUser.value.id)
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
    fetchAIQuota()
    fetchUnreadNotificationsCount()
  } else {
    aiQuota.value = null
    unreadNotificationsCount.value = 0
  }
})

onMounted(() => {
  if (loggedIn.value) {
    fetchAIQuota()
    fetchUnreadNotificationsCount()
  }
})

const onLogout = async () => {
  await UserApi.logout()
  AccountService.logout()
  router.push('/')
}
</script>

<style>
.app-bar-title {
  user-select: none;
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
