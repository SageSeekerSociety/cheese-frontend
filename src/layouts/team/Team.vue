<template>
  <v-app class="bg-page-background">
    <app-bar :links="links" />
    <v-main class="bg-grey-lighten-3">
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import AppBar from "@/components/common/AppBar/AppBar.vue";
import TeamCard from "@/components/common/team/TeamCard.vue";

// const fakeGroupData = {
//   teamNickName: "编程入门学习组",
//   teamDesc: "C++从入门到口口",
//   teamAvatar:
//     "https://pica.zhimg.com/v2-c9f27d4b3a6e090de02f71925f8d8f50_l.jpg?source=32738c0c",
// };

const fakeTeamData = {
  teamName: "音乐入门学习组",
  teamDesc: "散々雨に降られたって 笑っていられる",
  teamAvatar:
    "https://ods2.oddba.cn/user_files/66368/bbs/35961729_1676268464.png",
  teamAdmin: "Bocci",
};
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
</script>
