<template>
  <!-- <v-card v-for="target in groupTargetList.targets" :key="target.id" min-height="100px" flat>
    <v-card-title
      ><span class="text-h6 font-weight-bold">{{ target.name }}</span></v-card-title
    >
    <v-card-text>
      <p class="text-body-1">{{ item.author }}：{{ item.content }}</p>
      <p class="text-body-1">{{ target.intro }}</p>
    </v-card-text>
    <v-divider></v-divider>
  </v-card> -->
  <v-card v-if="loaded" flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <v-card v-for="target in groupTargetList" :key="target.id" min-height="100px" flat>
      <v-card-title
        ><span class="text-h6 font-weight-bold">{{ target.name }}</span></v-card-title
      >
      <v-card-text>
        <!-- <p class="text-body-1">{{ item.author }}：{{ item.content }}</p> -->
        <p class="text-body-1">{{ target.intro }}</p>
      </v-card-text>
      <v-divider></v-divider>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import type { GroupTarget } from '@/types'

import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { GroupApi } from '@/network/api/group'

const groupTargetList = ref<GroupTarget[]>([])
const route = useRoute()
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
  fetchGroupTargetList().then(({ data: { targets } }) => {
    groupTargetList.value = targets
    loaded.value = true
    console.log('***')
    console.log(groupId)
    console.log('***')

    console.log(groupTargetList.value)
  })
})
</script>
