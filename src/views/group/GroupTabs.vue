<template>
  <v-tabs v-model="selectedTab">
    <v-tab v-for="tab in tabs" :key="tab.label" :to="tab.route" exact>
      {{ tab.label }}
    </v-tab>
  </v-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const selectedTab = ref(0)

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
    label: '圈子成员',
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
      router.push({ name: 'GroupEdit' })
    },
  },
]
</script>
