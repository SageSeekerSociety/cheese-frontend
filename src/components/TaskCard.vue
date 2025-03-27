<template>
  <v-card flat class="task-card" rounded="md" :to="{ name: 'TasksDetail', params: { taskId: task.id } }">
    <div class="d-flex flex-column pa-4">
      <div class="d-flex justify-space-between">
        <div class="text-h6 font-weight-medium task-title">{{ task.name }}</div>
        <v-chip
          :color="taskStatusType"
          size="small"
          class="task-status-chip ms-2"
          :class="{ [`pulse-animation-${taskStatusType}`]: task.approved === 'NONE' }"
        >
          {{ taskStatusText }}
        </v-chip>
      </div>

      <div class="text-body-2 text-medium-emphasis mt-2 task-description">{{ task.intro }}</div>

      <div class="d-flex flex-wrap align-center justify-space-between mt-3">
        <div class="d-flex align-center text-caption text-medium-emphasis creator-info">
          <v-avatar size="20" class="me-2" :image="getAvatarUrl(task.creator.avatarId)"></v-avatar>
          <span>{{ task.creator.nickname }} 发布</span>
          <v-icon size="12" class="mx-1">mdi-circle-small</v-icon>
          <span>{{ dayjs(task.createdAt).format('MM-DD HH:mm') }}</span>
        </div>

        <div class="d-flex align-center gap-3 mt-2 mt-sm-0">
          <div v-if="task.topics && task.topics.length > 0" class="d-flex flex-wrap gap-1">
            <v-chip v-for="topic in task.topics" :key="topic.id" size="x-small" variant="tonal" class="task-topic-chip">
              {{ topic.name }}
            </v-chip>
          </div>
        </div>
      </div>

      <div class="d-flex align-center justify-end gap-3 mt-3">
        <div class="d-flex align-center text-caption">
          <v-icon size="small" color="primary" class="me-1">mdi-account-multiple</v-icon>
          <span>{{ task.submitters.total }}</span>
        </div>
        <div class="d-flex align-center text-caption">
          <v-icon size="small" color="primary" class="me-1">mdi-alarm</v-icon>
          <span>{{ formatDeadline(task.deadline) }}</span>
        </div>
      </div>
    </div>

    <v-alert
      v-if="task.approved === 'DISAPPROVED' && isSelfTask"
      type="error"
      class="mx-4 mb-4 mt-0"
      density="compact"
      title="审核未通过"
    >
      {{ task.rejectReason }}
    </v-alert>
  </v-card>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

import { computed, toRefs } from 'vue'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'
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

const formatDeadline = (deadline: number) => {
  const now = dayjs()
  const deadlineDay = dayjs(deadline)
  const diffDays = deadlineDay.diff(now, 'day')

  if (diffDays < 0) {
    return '已截止'
  } else if (diffDays === 0) {
    return '今日截止'
  } else if (diffDays === 1) {
    return '明日截止'
  } else if (diffDays < 7) {
    return `${diffDays}天后截止`
  } else {
    return dayjs(deadline).format('MM-DD')
  }
}
</script>

<style scoped lang="scss">
.task-card {
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.09);

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.15);
    background-color: rgba(var(--v-theme-primary), 0.02);
    transform: translateY(-1px);

    .task-title {
      color: rgb(var(--v-theme-primary));
    }
  }
}

.task-title {
  transition: color 0.2s ease;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.creator-info {
  flex-wrap: nowrap;
  overflow: hidden;
  max-width: 100%;
  white-space: nowrap;
}

.task-status-chip {
  font-weight: 500;
  letter-spacing: 0;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.task-topic-chip {
  font-weight: 400;
  letter-spacing: 0;
}

.pulse-animation-primary {
  animation: pulse-primary 2s infinite;
}

.pulse-animation-warning {
  animation: pulse-warning 2s infinite;
}

.pulse-animation-error {
  animation: pulse-error 2s infinite;
}

.pulse-animation-success {
  animation: pulse-success 2s infinite;
}

.pulse-animation-info {
  animation: pulse-info 2s infinite;
}

@keyframes pulse-primary {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(var(--v-theme-primary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0);
  }
}

@keyframes pulse-warning {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(var(--v-theme-warning), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0);
  }
}

@keyframes pulse-error {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(var(--v-theme-error), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0);
  }
}

@keyframes pulse-success {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(var(--v-theme-success), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0);
  }
}

@keyframes pulse-info {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-info), 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(var(--v-theme-info), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-info), 0);
  }
}

.pulse-animation {
  display: none;
}
</style>
