<template>
  <v-card rounded="lg">
    <v-card-title>正在进行的赛题</v-card-title>
    <v-card-text>
      <v-empty-state v-if="tasks.length === 0" title="暂无赛题" icon="mdi-clipboard-list" />
      <v-list v-else>
        <v-list-item v-for="task in tasks" :key="task.id" :title="task.name" />
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { TasksApi } from '@/network/api/tasks'

const route = useRoute()

const tasks = ref<Task[]>([])

const fetchTeamTasks = async (teamId: number) => {
  const { data } = await TasksApi.list({
    team: teamId,
    sort_by: 'deadline',
    sort_order: 'asc',
  })
  tasks.value = data.tasks
}

onMounted(async () => {
  const teamId = Number(route.params.teamId)
  await fetchTeamTasks(teamId)
})
</script>
