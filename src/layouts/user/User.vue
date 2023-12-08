<template>
  <v-app class="bg-page-background">
    <app-bar :links="links" />
    <user-card :userData="fakeUserData" />
  </v-app>
</template>

<script lang="ts" setup>
import AppBar from "@/components/common/AppBar/AppBar.vue";
import UserCard from "@/components/common/user/UserCard.vue";

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
];

const fakeUserData = {
  UserNickName: "Administrator",
  UserDesc: "芝士雪豹，一言以蔽之",
  UserAvatar:
    "https://pica.zhimg.com/v2-c9f27d4b3a6e090de02f71925f8d8f50_l.jpg?source=32738c0c",
};
</script>
