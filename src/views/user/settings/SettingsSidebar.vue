<template>
  <v-navigation-drawer permanent class="page-sidebar border-e-0 border-b-0" border="sm" color="grey-lighten-5">
    <div class="page-header">
      <v-avatar size="24" :image="getAvatarUrl(userData?.avatarId)" />
      <span class="text-subtitle-1">{{ userData?.nickname }}</span>
      <v-spacer></v-spacer>
    </div>
    <v-list nav bg-color="transparent" rounded="lg" color="primary">
      <v-list-item v-for="tab in tabs" :key="tab.label" rounded="lg" :value="tab.route.name" :to="tab.route">
        <template v-if="tab.icon" #prepend>
          <v-icon>{{ tab.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ tab.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import type { User } from '@/types/users'

import { inject } from 'vue'

import { getAvatarUrl } from '@/utils/materials'

import AccountService from '@/services/account'

const userData = AccountService._user

const tabs = [
  {
    label: '个人资料',
    route: {
      name: 'UserSettingsProfile',
    },
    icon: 'mdi-account',
  },
  {
    label: '实名信息',
    route: {
      name: 'UserSettingsRealName',
    },
    icon: 'mdi-account-card',
  },
  {
    label: '隐私中心',
    route: {
      name: 'UserPrivacyCenter',
    },
    icon: 'mdi-shield-lock',
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
