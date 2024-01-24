<template>
    <app-bar :links="links" />

    <v-main>
      <router-view />
    </v-main>
</template>
  
<script lang="ts" setup>
import MyApp from '@/components/common/MyApp.vue';
import AppBar from '@/components/common/AppBar/AppBar.vue'

const links = [
  {
    key: "Home",
    title: "首页",
    path: "/",
  },
  {
    key: "Question",
    title: "问答",
    path: "/question",
  },
  {
    key: "Group",
    title: "圈子",
    path: "/team",
  },
]
</script>
  