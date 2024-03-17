<template>
  <v-card flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <MemberRoster v-if="loaded" :members="userList" />
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GroupApi } from '@/network/api/group'
import { useRoute } from 'vue-router'
import MemberRoster from '@/components/group/MemberRoster.vue'
import { User } from '@/types/users'
import { GroupMember } from '@/types'
const route = useRoute()
// const userID = computed(() => parseInt(route.params.id[0], 10))
const userList = ref<GroupMember[]>([])
const loaded = ref(false)
const groupId = Number(route.params.groupId)

onMounted(() => {
  fetchData().then(({ data: { members } }) => {
    userList.value = members
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
