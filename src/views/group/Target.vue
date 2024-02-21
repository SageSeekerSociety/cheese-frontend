<template>
  <v-card v-if="loaded" flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <v-card v-for="target in groupTargetList.targets" :key="target.id" min-height="100px" flat>
      <target-card :target="target" />
      <v-divider></v-divider>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import TargetCard from '@/components/group/TargetCard.vue'

import { GroupApi } from '@/network/api/group'

import { TargetList } from '@/types/targetlist'

const route = useRoute()
const groupTargetList = ref<TargetList>({} as TargetList)
const groupId = Number(route.params.groupId)
const loaded = ref(false)

function fetchGroupTargetList() {
  const result = GroupApi.getGroupTargetList(groupId, {
    pageStart: 0,
    pageSize: 10,
  })
  return result
}

onMounted(() => {
  fetchGroupTargetList().then((result) => {
    groupTargetList.value = result.data
    loaded.value = true
  })
})
</script>
