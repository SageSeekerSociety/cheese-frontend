<template>
  <v-card flat border rounded="lg" :to="{ name: 'TasksDetail', params: { taskId: task.id } }">
    <div class="d-flex flex-row pa-4 gap-4">
      <div class="d-flex flex-column flex-grow-1">
        <div class="text-subtitle-2 text-medium-emphasis">
          {{ task.creator.nickname }} 发布于 {{ dayjs(task.createdAt).format('YYYY-MM-DD HH:mm') }}
        </div>
        <div class="text-h6">{{ task.name }}</div>
        <div class="text-subtitle-1 text-medium-emphasis task-description">{{ task.intro }}</div>
        <div v-if="task.topics" class="d-flex flex-row flex-wrap gap-2 mt-1">
          <v-chip v-for="topic in task.topics" :key="topic.id" size="small">{{ topic.name }}</v-chip>
        </div>
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
    </div>

    <v-alert v-if="task.approved === 'DISAPPROVED' && isSelfTask" type="error" class="mx-4 mb-4" title="审核未通过">
      理由：{{ task.rejectReason }}
    </v-alert>
  </v-card>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

import { computed, toRefs } from 'vue'
import dayjs from 'dayjs'

import { getTaskStatusText, getTaskStatusType } from '@/utils/tasks'

import AccountService from '@/services/account'

const props = defineProps<{
  task: Task
}>()

const { task } = toRefs(props)

const taskStatusText = computed(() => getTaskStatusText(task.value))

const taskStatusType = computed(() => getTaskStatusType(task.value))

const isSelfTask = computed(() => {
  return task.value.creator.id === AccountService.user?.id
})
</script>

<style scoped lang="scss">
.task-description {
  display: flex;
  flex-direction: column;
  line-clamp: 2;
  overflow: hidden;
}
</style>
