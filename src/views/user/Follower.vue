<template>
  <v-card flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <roster v-if="loaded" :users="userList" />
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserApi } from '@/network/api/users'
import { useRoute } from 'vue-router'
import Roster from '@/components/user/Roster.vue'
import { User } from '@/types/users'

const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0], 10))
const userList = ref<User[]>([])
const loaded = ref(false)

onMounted(() => {
  fetchData().then(({ data: { users } }) => {
    userList.value = users
    loaded.value = true
    // console.log(userList.value.users.length)
  })
})

function fetchData() {
  const result = UserApi.getUserFollower(userID.value, {
    pageStart: 0,
    pageSize: 10,
  })
  return result
}
</script>
