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
        <v-btn icon class="me-4" disabled>
          <v-icon>mdi-bell</v-icon>
        </v-btn>
        <v-menu
          v-if="loggedIn"
          v-model="menuOpen"
          open-on-hover
          open-on-click
          location="bottom center"
          :offset="16"
          :close-on-content-click="false"
        >
          <template #activator="{ props }">
            <user-avatar :avatar="avatar" :size="32" v-bind="props"></user-avatar>
          </template>

          <v-list max-width="300px" rounded="lg">
            <v-list-item :title="nickname" :subtitle="intro">
              <template #prepend>
                <user-avatar :avatar="avatar" :size="48"></user-avatar>
              </template>
            </v-list-item>
            <v-list-item>
              <div class="d-flex ga-2">
                <v-chip prepend-icon="mdi-account" color="text">UID: {{ currentUser?.id }}</v-chip>
              </div>
            </v-list-item>
            <v-list-item>
              <v-card variant="tonal" color="primary" class="rounded-lg">
                <v-card-item prepend-icon="mdi-creation">
                  <v-card-title>知启星 AI</v-card-title>
                </v-card-item>
                <v-card-text>
                  <div class="d-flex justify-space-between align-center text-body-2 mb-1">
                    <span>今日剩余额度</span>
                    <span class="text-primary font-weight-medium">
                      {{ aiQuota?.remaining ?? '-' }}/{{ aiQuota?.total ?? '-' }}
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="aiQuota ? (aiQuota.remaining / aiQuota.total) * 100 : 0"
                    color="primary"
                    height="8"
                    rounded
                  ></v-progress-linear>
                  <div class="text-caption text-medium-emphasis mt-1">
                    将在 {{ aiQuota ? dayjs(aiQuota.reset_time).fromNow() : '-' }}重置
                  </div>
                </v-card-text>
              </v-card>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
            <v-list-item :to="{ name: 'UserDefault', params: { id: currentUser?.id } }">
              <template #prepend>
                <v-icon icon="mdi-account"></v-icon>
              </template>
              <v-list-item-title>个人中心</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="onLogout">
              <template #prepend>
                <v-icon icon="mdi-exit-to-app"></v-icon>
              </template>
              <v-list-item-title>退出登录</v-list-item-title>
            </v-list-item>
          </v-list>
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

import UserAvatar from '../UserAvatar.vue'

import logo from '@/assets/logo.svg?url'
import { AIApi } from '@/network/api/ai'
import { UserApi } from '@/network/api/users'
import AccountService from '@/services/account'

const appBarProps = withDefaults(defineProps<AppBarProps>(), {
  links: () => [],
})

const { links } = toRefs(appBarProps)

const router = useRouter()

const menuOpen = ref(false)

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

watch(loggedIn, (newValue) => {
  if (newValue) {
    fetchAIQuota()
  } else {
    aiQuota.value = null
  }
})

onMounted(() => {
  if (loggedIn.value) {
    fetchAIQuota()
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
</style>
