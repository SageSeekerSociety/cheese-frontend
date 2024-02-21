<template>
  <v-card flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <roster v-if="loaded" :users="userList.users" />
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserApi } from '@/network/api/user'
import { useRoute } from 'vue-router'
import Roster from '@/components/user/Roster.vue'
import { UserList } from '@/types/userlist'

const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0], 10))
const userList = ref<UserList>({} as UserList)
const loaded = ref(false)

onMounted(() => {
  fetchData().then((result) => {
    userList.value = result.data
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
@/types/userlist
