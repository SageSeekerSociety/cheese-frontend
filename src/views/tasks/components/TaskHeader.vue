<template>
  <v-row>
    <v-col cols="12">
      <div class="d-flex flex-wrap align-center gap-4 mb-4">
        <!-- 面包屑导航 -->
        <v-breadcrumbs v-if="breadcrumbItems" :items="breadcrumbItems" density="compact" class="pa-0">
          <template #prepend>
            <v-icon icon="mdi-cheese" class="text-primary mr-1"></v-icon>
          </template>
        </v-breadcrumbs>

        <v-spacer></v-spacer>

        <!-- 管理功能 -->
        <div v-if="isCreator || isAdmin" class="d-flex align-center gap-2">
          <v-btn-group color="primary" density="comfortable" rounded="lg">
            <v-btn prepend-icon="mdi-pencil" @click="$emit('edit')">编辑</v-btn>
            <v-btn icon @click="$emit('delete')">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-btn-group>
        </div>
      </div>

      <!-- 赛题标题信息卡片 -->
      <v-card flat class="mb-4 task-header-card">
        <div class="task-header-inner pa-5 pa-sm-6">
          <div class="d-flex flex-column flex-md-row justify-space-between gap-4">
            <div class="task-header-content">
              <div class="d-flex align-center flex-wrap ga-4 mb-3">
                <div class="task-icon-wrapper">
                  <v-icon color="primary" size="32">mdi-trophy-outline</v-icon>
                </div>
                <div>
                  <div
                    class="task-header-title text-h4 font-weight-bold mb-1"
                    :class="{ 'title-with-punctuation': titleWithPunctuation }"
                  >
                    {{ taskData.name }}
                  </div>
                  <div class="text-medium-emphasis d-flex align-center flex-wrap gap-x-2">
                    <span class="d-flex align-center">
                      <v-avatar size="24" class="mr-1">
                        <v-img
                          v-if="taskData.creator.avatarId"
                          :src="getAvatarUrl(taskData.creator.avatarId)"
                          alt="创建者头像"
                        ></v-img>
                        <v-icon v-else>mdi-account</v-icon>
                      </v-avatar>
                      {{ taskData.creator.nickname }}
                    </span>
                    <v-icon size="small" class="mx-1">mdi-circle-small</v-icon>
                    <span>发布于 {{ formatDate(taskData.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2 mt-2">
                <v-chip :color="taskStatusType" label size="small" class="task-status-chip">{{
                  taskStatusText
                }}</v-chip>
                <v-chip color="primary" variant="flat" label size="small">
                  {{ taskData.submitterType === 'USER' ? '个人任务' : '小队任务' }}
                </v-chip>
                <v-chip v-if="taskData.resubmittable" variant="outlined" label size="small">可重复提交</v-chip>
              </div>
            </div>

            <div class="task-actions d-flex align-center gap-3">
              <!-- 参与状态和行动按钮 -->
              <template v-if="!taskData.joined && canUserJoin">
                <v-btn color="primary" class="join-btn" rounded="lg" @click="$emit('join')">
                  <v-icon start icon="mdi-arrow-right" class="mr-1"></v-icon>
                  领取赛题
                </v-btn>
              </template>
              <template v-else-if="taskData.joined">
                <v-btn
                  v-if="taskData.submittable"
                  color="primary"
                  variant="flat"
                  rounded="lg"
                  :to="{ name: 'TasksSubmit', params: { taskId: taskData.id } }"
                >
                  <v-icon start icon="mdi-upload" class="mr-1"></v-icon>
                  前往提交
                </v-btn>
                <v-btn color="error" variant="outlined" rounded="lg" @click="$emit('leave')"> 退出赛题 </v-btn>
              </template>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

import { computed } from 'vue'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

const props = defineProps<{
  taskData: Task
  breadcrumbItems: any[] | null
  isCreator: boolean
  isAdmin: boolean
  taskStatusText: string
  taskStatusType: string
  titleWithPunctuation: boolean
}>()

const canUserJoin = computed(() => {
  if (!props.taskData) return false

  if (props.taskData.submitterType === 'USER') {
    return !!props.taskData.participationEligibility?.user?.eligible
  } else {
    return !!props.taskData.participationEligibility?.teams?.some((team) => team.eligibility.eligible)
  }
})

defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'join'): void
  (e: 'leave'): void
}>()

const formatDate = (date: string | Date | number) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style scoped>
.task-header-card {
  background: linear-gradient(to right, rgb(var(--v-theme-surface)), rgb(var(--v-theme-background)));
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border-radius: 8px;
  color: rgb(var(--v-theme-on-surface));
}

.task-header-title {
  display: inline-block;
  font-size: 2rem !important;
}

.title-with-punctuation {
  text-indent: -0.5em;
}

.task-header-inner {
  position: relative;
  z-index: 2;
}

.task-header-inner::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 30%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.1), transparent 70%);
  opacity: 0.6;
  z-index: -1;
}

.task-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.15));
  border-radius: 8px;
  position: relative;
}

.task-icon-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  opacity: 0.8;
}

.task-status-chip {
  position: relative;
  overflow: hidden;
}

.task-header-card:hover {
  border-bottom-color: rgba(var(--v-theme-primary), 0.25);
}

.join-btn {
  background: linear-gradient(to right, rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary)));
  box-shadow: 0 2px 8px -2px rgba(var(--v-theme-primary), 0.6);
  border-radius: 6px;
  min-width: 120px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.join-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 6px 6px 0 0;
}

.join-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -3px rgba(var(--v-theme-primary), 0.7);
}
</style>
