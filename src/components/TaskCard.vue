<template>
  <v-card
    flat
    border
    rounded="lg"
    class="d-flex flex-row pa-4 gap-4"
    :to="{ name: 'TasksDetail', params: { taskId: task.id } }"
  >
    <div class="d-flex flex-column flex-grow-1">
      <div class="text-subtitle-2 text-medium-emphasis">
        {{ task.creator.nickname }} 发布于 {{ dayjs(task.createdAt).format('YYYY-MM-DD HH:mm') }}
      </div>
      <div class="text-h6">{{ task.name }}</div>
      <div class="text-subtitle-1 text-medium-emphasis task-description">{{ task.intro }}</div>
    </div>
    <div class="d-flex flex-column align-end flex-shrink-0 gap-1">
      <v-chip :color="taskStatusType" size="small">{{ taskStatusText }}</v-chip>
      <div class="text-subtitle-2 text-medium-emphasis">
        <v-icon left>mdi-alarm</v-icon>
        {{ dayjs(task.deadline).format('YYYY-MM-DD HH:mm') }}
      </div>
      <div class="text-subtitle-2 text-medium-emphasis">
        <v-icon left>mdi-account-multiple</v-icon>
        {{ task.submitters.total }}
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

import { computed, toRefs } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  task: Task
}>()

const { task } = toRefs(props)

const taskStatusText = computed(() => {
  if (!task.value) return ''
  if (!task.value.approved) return '审核中'
  if (new Date(task.value.deadline) < new Date()) return '已结束'
  return '进行中'
})

const taskStatusType = computed(() => {
  if (!task.value) return undefined
  if (!task.value.approved) return 'info'
  if (new Date(task.value.deadline) < new Date()) return 'error'
  return 'primary'
})
</script>

<style scoped lang="scss">
.task-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
