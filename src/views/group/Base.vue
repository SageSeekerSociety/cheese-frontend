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
      <v-dialog v-model="dialog" max-width="290">
        <v-card>
          <v-card-title class="headline">确认退出</v-card-title>

          <v-card-text> 你确定要退出这个小组吗？ </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" @click="dialog = false">取消</v-btn>

            <v-btn color="red darken-1" @click="leaveGroup">确认退出</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GroupCard from '@/components/group/GroupCard.vue'

import { GroupApi } from '@/network/api/group'

import { Group } from '@/types/group'

const route = useRoute()
const router = useRouter()

const groupInfo = ref<Group>({} as Group)
const groupId = computed(() => Number(route.params.groupId))
const loaded = ref(false)
const selectedTab = ref(0)
const dialog = ref(false)
// console.log(groupId)
watch(
  () => route.params.groupId,
  () => {
    window.location.reload()
  }
)
onMounted(() => {
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

function leaveGroup() {
  // const result = GroupApi.leaveGroup(groupId.value)
  // result.then(() => {
  //   router.push({ name: 'GroupDefault' })
  // })
  console.log('leave group')
}
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
      dialog.value = true
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
      router.push({ name: 'GroupManage', params: { groupId: route.params.groupId } })
      console.log('管理小组')
    },
  },
]
</script>
