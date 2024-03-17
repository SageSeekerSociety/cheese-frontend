<template>
  <template v-if="loaded">
    <v-card
      v-for="target in groupTargetList"
      :key="target.id"
      min-height="100px"
      flat
      :to="{ name: 'GroupTargetBase', params: { targetId: target.id } }"
    >
      <v-card-title>
        <span class="text-h6 font-weight-bold">{{ target.name }}</span>
      </v-card-title>
      <v-card-text>
        <!-- <p class="text-body-1">{{ item.author }}：{{ item.content }}</p> -->
        <p class="text-body-1">{{ target.intro }}</p>
      </v-card-text>
    </v-card>
  </template>
  <template v-else>
    <v-skeleton-loader type="paragraph"></v-skeleton-loader>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GroupApi } from '@/network/api/group'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { GroupTarget } from '@/types'

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
    // console.log('***')
    // console.log(groupId)
    // console.log('***')

    // console.log(groupTargetList.value)
  })
})
</script>
