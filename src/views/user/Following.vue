<template>
  <v-card flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <roster v-if="loaded" :users="userList" />
  </v-card>
</template>

<script setup lang="ts">
import type { User } from '@/types/users'

import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import Roster from '@/components/user/Roster.vue'
import { UserApi } from '@/network/api/users'

const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0], 10))
const userList = ref<User[]>([])
const loaded = ref(false)

onMounted(() => {
  fetchData().then(({ data: { users } }) => {
    userList.value = users
    loaded.value = true
  })
})

function fetchData() {
  const result = UserApi.getUserFollowing(userID.value, {
    pageStart: 0,
    pageSize: 10,
  })
  return result
}
</script>
@/types/userlist @/network/api/users/user
