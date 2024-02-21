<template>
  <v-card flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <roster v-if="loaded" :users="userList.users" />
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

import Roster from '@/components/user/Roster.vue'

import { GroupApi } from '@/network/api/group'

import { UserList } from '@/types/userlist'

const route = useRoute()
const userList = ref<UserList>({} as UserList)
const loaded = ref(false)
const groupId = Number(route.params.groupId)

onMounted(() => {
  fetchData().then((result) => {
    userList.value = result.data
    loaded.value = true
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
