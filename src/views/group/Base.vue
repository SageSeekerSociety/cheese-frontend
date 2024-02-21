<script lang="ts" setup>
import { ref } from 'vue'
import GroupCard from '@/components/group/GroupCard.vue'

// const fakeGroupData = {
//   groupNickName: "编程入门学习组",
//   groupDesc: "C++从入门到口口",
//   groupAvatar:
//     "https://pica.zhimg.com/v2-c9f27d4b3a6e090de02f71925f8d8f50_l.jpg?source=32738c0c",
// };
const fakeGroupData = {
  groupid: 520,
  groupName: '音乐入门学习组',
  groupDesc: '散々雨に降られたって 笑っていられる',
  groupAvatar: 'https://ods2.oddba.cn/user_files/66368/bbs/35961729_1676268464.png',
  groupAdmin: 'Bocci',
}
const selectedTab = ref(0)

const tabs = [
  { label: '提问', route: '' },
  { label: '打卡', route: 'target' },
]
</script>

<template>
  <group-card :group-data="fakeGroupData" />
  <v-container>
    <v-row>
      <v-col class="pr-0">
        <v-sheet rounded="lg">
          <v-tabs v-model="selectedTab">
            <v-tab v-for="tab in tabs" :key="tab.label" :to="`/groups/${fakeGroupData.groupid}/${tab.route}`" exact>
              {{ tab.label }}
            </v-tab>
          </v-tabs>

          <router-view />
        </v-sheet>
      </v-col>

      <v-col cols="3">
        <v-sheet rounded="lg">
          <v-list rounded="lg">
            <v-list-item v-for="n in 5" :key="n" link :title="`List Item ${n}`"></v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item color="grey-lighten-4" link title="Refresh"></v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
