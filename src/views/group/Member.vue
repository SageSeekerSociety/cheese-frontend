<template>
  <v-card flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <roster v-if="loaded" :users="userList" />
  </v-card>
</template>

<script setup lang="ts">
import type { User } from '@/types/users'

import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import Roster from '@/components/user/Roster.vue'
import { GroupApi } from '@/network/api/group'

const route = useRoute()
// const userID = computed(() => parseInt(route.params.id[0], 10))
const userList = ref<User[]>([])
const loaded = ref(false)
const groupId = Number(route.params.groupId)

onMounted(() => {
  fetchData().then(({ data: { users } }) => {
    userList.value = users
    loaded.value = true
    // console.log(userList.value.users.length)
  })
})

function fetchData() {
  const result = GroupApi.getGroupMemberList(groupId, {
    pageStart: 0,
    pageSize: 10,
  })
  return result
}
</script>
