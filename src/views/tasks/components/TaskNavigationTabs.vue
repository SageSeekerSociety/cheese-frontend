<template>
  <v-card flat class="mb-4 overflow-hidden task-tabs-card">
    <v-tabs
      :model-value="modelValue"
      show-arrows
      slider-color="primary"
      bg-color="background"
      class="task-navigation-tabs"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <v-tab :value="'overview'" :to="{ name: 'TasksDetail', params: { taskId: taskData.id } }" exact>
        <v-icon start>mdi-information-outline</v-icon>
        概览
      </v-tab>

      <v-tab
        v-if="isCreator || isAdmin"
        :value="'participants'"
        :to="{ name: 'TasksParticipants', params: { taskId: taskData.id } }"
      >
        <v-icon start>mdi-account-group</v-icon>
        参与者
      </v-tab>

      <v-tab
        v-if="taskData.joined && taskData.submittable"
        :value="'submissions'"
        :to="{ name: 'TasksSubmissions', params: { taskId: taskData.id } }"
      >
        <v-icon start>mdi-tray-full</v-icon>
        提交记录
      </v-tab>

      <v-tab
        v-if="taskData.joined && taskData.submittable"
        :value="'submit'"
        :to="{ name: 'TasksSubmit', params: { taskId: taskData.id } }"
      >
        <v-icon start>mdi-upload</v-icon>
        提交
      </v-tab>

      <v-tab
        v-if="taskData.joined || taskData.joinable"
        :value="'ai-advice'"
        :to="{ name: 'TasksAIAdvice', params: { taskId: taskData.id } }"
      >
        <v-icon start>mdi-robot</v-icon>
        启星研导
      </v-tab>
    </v-tabs>
  </v-card>
</template>

<script setup lang="ts">
import { Task } from '@/types'

defineProps<{
  taskData: Task
  isCreator: boolean
  isAdmin: boolean
  modelValue: any
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>

<style scoped>
.task-tabs-card {
  background-color: var(--v-theme-surface);
  transition: all 0.3s ease;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.task-tabs-card::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(var(--v-theme-primary), 0.25),
    rgba(var(--v-theme-primary), 0.15),
    rgba(var(--v-theme-primary), 0.02)
  );
  z-index: 1;
}

.task-navigation-tabs {
  overflow: hidden;
}

.task-navigation-tabs :deep(.v-tab) {
  min-height: 46px;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
  opacity: 0.8;
  transition: all 0.25s ease;
  border-radius: 0;
  position: relative;
}

.task-navigation-tabs :deep(.v-tab:hover) {
  opacity: 0.95;
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.task-navigation-tabs :deep(.v-tab--selected) {
  background-color: transparent;
  color: rgb(var(--v-theme-primary));
  opacity: 1;
  font-weight: 600;
}

.task-navigation-tabs :deep(.v-tab--selected::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 2px;
  background-color: rgb(var(--v-theme-primary));
  border-radius: 2px 2px 0 0;
}
</style>
