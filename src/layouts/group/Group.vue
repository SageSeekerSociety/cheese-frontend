<template>
  <app-bar :links="links" />
  <v-main class="bg-grey-lighten-3">
    <router-view />
  </v-main>
</template>

<script lang="ts" setup>
import AppBar from '@/components/common/AppBar/AppBar.vue'

// const fakeGroupData = {
//   groupNickName: "编程入门学习组",
//   groupDesc: "C++从入门到口口",
//   groupAvatar:
//     "https://pica.zhimg.com/v2-c9f27d4b3a6e090de02f71925f8d8f50_l.jpg?source=32738c0c",
// };

// const fakeGroupData = {
//   groupName: '音乐入门学习组',
//   groupDesc: '散々雨に降られたって 笑っていられる',
//   groupAvatar: 'https://ods2.oddba.cn/user_files/66368/bbs/35961729_1676268464.png',
//   groupAdmin: 'Bocci',
// }

const links = [
  {
    key: 'Home',
    title: '首页',
    path: '/',
  },
  {
    key: 'Question',
    title: '问答',
    path: '/questions',
  },
  {
    key: 'Group',
    title: '圈子',
    path: '/groups',
  },
]
</script>
