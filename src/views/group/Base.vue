<template>
  <v-main v-if="loaded" class="bg-grey-lighten-3">
    <group-card :profile="groupInfo" />
    <v-container class="d-flex row">
      <v-row>
        <v-col class="pr-0">
          <v-sheet rounded="lg">
            <router-view />
          </v-sheet>
        </v-col>
        <v-col cols="3">
          <v-sheet class="pt-3 pb-3 rounded-lg">
            <v-tabs v-model="selectedTab" direction="vertical">
              <v-tab v-for="tab in tabs" :key="tab.label" :to="tab.route" exact>
                {{ tab.label }}
              </v-tab>
            </v-tabs>
            <v-divider class="my-2"></v-divider>
            <v-list rounded="lg">
              <v-list-item
                v-for="linkitem in linkitems"
                :key="linkitem.title"
                :disabled="linkitem.disabled"
                :title="linkitem.title"
                style="font-size: 10px"
                @click="linkitem.fun"
              ></v-list-item>
            </v-list>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <!-- <group-card v-if="loaded" :profile="groupInfo" />

  <v-container>
    <v-row>
      <v-col class="pr-0">
        <v-sheet rounded="lg">
          <v-tabs v-model="selectedTab">
            <v-tab v-for="tab in tabs" :key="tab.label" :to="`/groups/${groupId}/${tab.route}`" exact>
              {{ tab.label }}
            </v-tab>
          </v-tabs>

          <router-view />
        </v-sheet>
      </v-col>

      <v-col cols="3">
        <v-sheet rounded="lg">
          <v-list rounded="lg">
            <v-list-item
              v-for="linkitem in linkitems"
              :disabled="linkitem.disabled"
              link
              :title="linkitem.title"
            ></v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item color="grey-lighten-4" link title="Refresh"></v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container> -->
</template>

<script lang="ts" setup>
import type { Group } from '@/types'

import { computed, ref, watch } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

import GroupCard from '@/components/group/GroupCard.vue'
import { GroupApi } from '@/network/api/group'

const groupInfo = ref<Group>({} as Group)
const route = useRoute()
const router = useRouter()
const groupId = computed(() => Number(route.params.groupId))
const loaded = ref(false)
const selectedTab = ref(0)

// console.log(groupId)
watch(
  () => route.params.groupId,
  () => {
    window.location.reload()
  }
)
onMounted(() => {
  // console.log('***')
  fetchGroupInfo().then(({ data: { group } }) => {
    groupInfo.value = group
    loaded.value = true
    console.log(groupInfo.value)
  })
})

function fetchGroupInfo() {
  const result = GroupApi.getGroupInfo(groupId.value)
  return result
}

// const fakeGroupData = {
//   groupid: 520,
//   groupName: '音乐入门学习组',
//   groupDesc: '散々雨に降られたって 笑っていられる',
//   groupAvatar: 'https://ods2.oddba.cn/user_files/66368/bbs/35961729_1676268464.png',
//   groupAdmin: 'Bocci',
// }

const tabs = [
  {
    label: '提问',
    route: {
      name: 'GroupQuestion',
      params: { groupId: route.params.groupId },
    },
  },
  {
    label: '打卡',
    route: {
      name: 'GroupTarget',
      params: { groupId: route.params.groupId },
    },
  },
  {
    label: '小组成员',
    route: {
      name: 'GroupMember',
      params: { groupId: route.params.groupId },
    },
  },
]

const linkitems = [
  {
    title: '加入小组',
    disabled: true,
    fun: () => {
      console.log('加入小组')
    },
  },
  {
    title: '退出小组',
    disabled: false,
    fun: () => {
      console.log('退出小组')
    },
  },
  {
    title: '创建问题',
    disabled: false,
    fun: () => {
      console.log('创建问题')
    },
  },
  {
    title: '创建打卡',
    disabled: false,
    fun: () => {
      console.log('创建打卡')
    },
  },
  {
    title: '管理小组',
    disabled: false,
    fun: () => {
      console.log('管理小组')
    },
  },
]
</script>
