<template>
  <app-bar :links="links" />

  <v-main>
    <router-view />
  </v-main>
</template>

<script lang="ts" setup>
import AppBar from '@/components/common/AppBar/AppBar.vue'

const links = [
  {
    key: 'Home',
    title: '首页',
    path: '/',
  },
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
