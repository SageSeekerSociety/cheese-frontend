<template>
  <v-app class="bg-page-background">
    <app-bar :links="links" />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
  
<script lang="ts" setup>
import AppBar from '@/components/common/AppBar/AppBar.vue'

const links = [
  {
    key: "Home",
    title: "首页",
    path: "/",
  },
  {
    key: "Team",
    title: "小组",
    path: "/team",
  },
  {
    key: "Explore",
    title: "发现",
    path: "/explore",
  },
]
</script>
  