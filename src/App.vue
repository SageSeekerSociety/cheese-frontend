<template>
  <my-app>
    <keep-alive>
      <app-bar v-if="!hideAppBar" :links="links" />
    </keep-alive>
    <router-view />
  </my-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import MyApp from './components/common/MyApp.vue'

import AppBar from '@/components/common/AppBar/AppBar.vue'

const currentRoute = useRoute()

const hideAppBar = computed(() => {
  return currentRoute.meta.hideAppBar
})

const links = [
  // {
  //   key: 'Home',
  //   title: '首页',
  //   path: '/',
  // },
  // {
  //   key: 'Question',
  //   title: '问答',
  //   path: '/questions',
  // },
  {
    key: 'Spaces',
    title: '空间',
    path: '/spaces',
  },
  {
    key: 'Teams',
    title: '小队',
    path: '/teams',
  },
]
</script>
