<template>
  <v-container v-if="loaded">
    <v-row>
      <v-col cols="12">
        <v-sheet rounded="lg" color="transparent" class="pa-4 d-flex align-center">
          <v-avatar size="80" class="mr-4">
            <v-img :src="getAvatarUrl(userData?.avatarId)" />
          </v-avatar>
          <div>
            <div class="text-h5">{{ userData?.nickname }}</div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3" class="pr-0">
        <v-sheet class="rounded-lg">
          <v-list nav bg-color="transparent" rounded="lg" color="primary">
            <v-list-item v-for="tab in tabs" :key="tab.label" rounded="lg" :value="tab.route.name" :to="tab.route">
              <template v-if="tab.icon" #prepend>
                <v-icon>{{ tab.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ tab.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet rounded="lg" color="transparent">
          <router-view />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import type { User } from '@/types/users'

import { onMounted, provide, ref } from 'vue'

import { getAvatarUrl } from '@/utils/materials'

import { UserApi } from '@/network/api/users'
import { currentUserId } from '@/services/account'

const selectedTab = ref<string | null>(null)
const userData = ref<User>()
const loaded = ref(false)

const fetchData = async () => {
  if (!currentUserId.value) {
    loaded.value = true
    return
  }
  const {
    data: { user },
  } = await UserApi.getUserInfo(currentUserId.value)
  userData.value = user
  loaded.value = true
}

onMounted(async () => {
  await fetchData()
})

provide('userData', userData)

const tabs = [
  // {
  //   label: '提问',
  //   route: {
  //     name: 'UserQuestion',
  //   },
  // },
  // {
  //   label: '回答',
  //   route: {
  //     name: 'UserAnswer',
  //   },
  // },
  {
    label: '个人资料',
    route: {
      name: 'UserSettingsProfile',
    },
    icon: 'mdi-account',
  },
  {
    label: '密码与安全',
    route: {
      name: 'UserSettingsSecurity',
    },
    icon: 'mdi-lock',
  },
]
</script>
