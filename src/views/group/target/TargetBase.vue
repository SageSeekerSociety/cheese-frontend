<template>
  <v-container>
    <template v-if="data">
      <v-card rounded="lg" flat>
        <v-card-item>
          <v-card-title>{{ data.target.name }}</v-card-title>
          <v-card-subtitle>
            创建于
            {{ dayjs(data.target.created_at).format('YYYY-MM-DD') }}
          </v-card-subtitle>
        </v-card-item>
        <v-card-text>
          {{ data.target.intro }}
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { GroupApi } from '@/network/api/group'
import { GetGroupTargetDetailResponse } from '@/network/api/group/types'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'

const route = useRoute()

const data = ref<GetGroupTargetDetailResponse | null>(null)

onMounted(async () => {
  const groupId = Number(route.params.groupId)
  const targetId = Number(route.params.targetId)
  await load(groupId, targetId)
})

const load = async (groupId: number, targetId: number) => {
  const { data: newData } = await GroupApi.getGroupTargetDetail(groupId, targetId)
  data.value = newData
}
</script>
