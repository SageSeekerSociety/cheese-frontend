<template>
  <v-tabs v-model="model" show-arrows slider-color="primary" bg-color="transparent">
    <v-tab
      :value="'overview'"
      :to="{ name: 'TasksDetail', params: { taskId: taskData.id }, query: $route.query }"
      exact
    >
      <v-icon start>mdi-information-outline</v-icon>
      概览
    </v-tab>

    <v-tab
      v-if="isCreator || isAdmin"
      :value="'participants'"
      :to="{ name: 'TasksParticipants', params: { taskId: taskData.id }, query: $route.query }"
    >
      <v-icon start>mdi-account-group</v-icon>
      参与者
    </v-tab>

    <v-tab
      v-if="taskData.joined && taskData.submittable"
      :value="'submissions'"
      :to="{ name: 'TasksSubmissions', params: { taskId: taskData.id }, query: $route.query }"
    >
      <v-icon start>mdi-tray-full</v-icon>
      提交记录
    </v-tab>

    <v-tab
      v-if="taskData.joined && taskData.submittable"
      :value="'submit'"
      :to="{ name: 'TasksSubmit', params: { taskId: taskData.id }, query: $route.query }"
    >
      <v-icon start>mdi-upload</v-icon>
      提交
    </v-tab>

    <v-tab :value="'ai-advice'" :to="{ name: 'TasksAIAdvice', params: { taskId: taskData.id }, query: $route.query }">
      <v-icon start>mdi-robot</v-icon>
      启星研导
    </v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
import { Task } from '@/types'

const model = defineModel<string>()

defineProps<{
  taskData: Task
  isCreator: boolean
  isAdmin: boolean
}>()
</script>
