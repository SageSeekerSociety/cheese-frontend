<template>
  <div>
    <!-- 赛题状态提示 -->
    <v-alert
      v-if="taskData?.approved === 'DISAPPROVED' && isSelfTask"
      type="error"
      class="mb-4"
      rounded="lg"
      title="审核未通过"
      text="您的赛题未通过审核"
    >
      <template #text>
        <div class="mt-2">
          <div class="font-weight-medium">驳回理由：</div>
          <div>{{ taskData.rejectReason }}</div>
        </div>
      </template>
    </v-alert>
    <!-- 不可加入原因提示 -->
    <v-alert
      v-if="!taskData?.joinable && !taskData?.joined && taskData?.joinRejectReason && !isDeadlinePassed"
      type="warning"
      class="mb-4"
      rounded="lg"
      title="暂时无法参与"
    >
      <template #text>
        <div class="mt-2">
          <div class="font-weight-medium">{{ joinRejectReasonText }}</div>
          <div v-if="taskData?.joinRejectReason === 'YourRankIsNotHighEnoughError'" class="mt-2 text-medium-emphasis">
            完成更多基础题目来提升您的等级，解锁更高难度的挑战。
          </div>
        </div>
      </template>
    </v-alert>
    <!-- 
    <v-alert
      v-else-if="taskData?.joined && (taskData?.joinedApproved === false || taskData?.joinedDisapproved)"
      type="info"
      class="mb-4"
      rounded="lg"
      :title="taskData.joinedDisapproved ? '审核未通过' : '等待审核'"
      :text="taskData.joinedDisapproved ? '您的参与申请未通过审核' : '您的参与申请正在审核中'"
    >
    </v-alert> -->

    <!-- AI建议入口卡片 -->
    <v-card
      v-if="taskData?.joined || taskData?.joinable"
      flat
      rounded="lg"
      class="gradient-card cursor-pointer mb-4"
      elevation="0"
      @click="goToAIAdvice"
    >
      <v-card-text class="pa-6">
        <div class="d-flex align-center gap-4">
          <v-avatar color="primary-lighten-4" size="56" class="elevation-0">
            <v-icon color="primary" size="32">mdi-robot</v-icon>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="text-h5 font-weight-bold d-flex flex-wrap align-center gap-2">
              <span>启星研导 <span class="text-primary">Navigator AI</span></span>
              <span class="text-caption text-disabled d-block d-sm-inline-block">
                Powered by 知启星 AI & DeepSeek-R1
              </span>
            </div>
            <div class="text-medium-emphasis">为您解析赛题核心，推荐学习路径，助力科研探索</div>
          </div>

          <v-btn
            color="primary"
            variant="tonal"
            rounded="pill"
            :to="{ name: 'TasksAIAdvice', params: { taskId: taskData?.id } }"
            class="px-4"
          >
            查看建议
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 赛题详情 -->
    <v-card flat rounded="lg" class="mb-4 task-detail-card">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
              <v-icon color="primary" size="28">mdi-information-outline</v-icon>
            </v-avatar>
          </div>
        </template>
        <v-card-title class="text-h5 ps-0">赛题详情</v-card-title>
      </v-card-item>

      <v-card-text>
        <div class="task-description">
          <TipTapViewer :value="taskDescription" />
        </div>
      </v-card-text>
    </v-card>

    <!-- 截止时间信息 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card flat rounded="lg" class="h-100 task-info-card">
          <v-card-item>
            <template #prepend>
              <div class="me-3">
                <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                  <v-icon color="primary" size="28">mdi-clock-outline</v-icon>
                </v-avatar>
              </div>
            </template>
            <v-card-title class="text-h5 ps-0">时间信息</v-card-title>
          </v-card-item>

          <v-divider class="mx-6"></v-divider>

          <v-card-text class="px-6 py-4">
            <div class="d-flex flex-column gap-3">
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">报名截止时间</div>
                <div class="d-flex align-center">
                  <span class="text-primary font-weight-medium">
                    {{ formatTaskDate(taskData?.deadline) }}
                  </span>
                  <v-chip v-if="isDeadlineSoon(taskData?.deadline)" color="error" size="small" class="ms-2">
                    即将截止
                  </v-chip>
                </div>
              </div>

              <v-divider></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">默认提交期限</div>
                <div class="text-primary font-weight-medium">{{ taskData?.defaultDeadline || 0 }} 天</div>
              </div>

              <div v-if="taskData?.joined && taskUserDeadline" class="mt-2">
                <v-alert type="info" variant="tonal" density="comfortable" rounded="lg">
                  <template #text>
                    <div class="d-flex align-center justify-space-between">
                      <span>您的提交截止时间：</span>
                      <CountdownTimer :deadline="taskUserDeadline" label="" class="text-right" />
                    </div>
                  </template>
                </v-alert>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card flat rounded="lg" class="h-100 task-info-card">
          <v-card-item>
            <template #prepend>
              <div class="me-3">
                <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                  <v-icon color="primary" size="28">mdi-information-outline</v-icon>
                </v-avatar>
              </div>
            </template>
            <v-card-title class="text-h5 ps-0">赛题信息</v-card-title>
          </v-card-item>

          <v-divider class="mx-6"></v-divider>

          <v-card-text class="px-6 py-4">
            <div class="d-flex flex-column gap-3">
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">提交类型</div>
                <v-chip color="primary" variant="flat">
                  {{ taskData?.submitterType === 'USER' ? '个人任务' : '小队任务' }}
                </v-chip>
              </div>

              <v-divider></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">难度等级</div>
                <div>
                  <v-rating
                    :model-value="rankStars"
                    color="amber"
                    half-increments
                    readonly
                    density="compact"
                  ></v-rating>
                </div>
              </div>

              <v-divider></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">提交次数</div>
                <v-chip :color="taskData?.resubmittable ? 'success' : 'warning'" variant="flat">
                  {{ taskData?.resubmittable ? '可多次提交' : '仅可提交一次' }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskMembership } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

import { TasksApi } from '@/network/api/tasks'
import { TaskParticipationInfo } from '@/network/api/tasks/types'
import AccountService from '@/services/account'

const TipTapViewer = defineAsyncComponent(() => import('@/components/common/Editor/TipTapViewer.vue'))
const CountdownTimer = defineAsyncComponent(() => import('@/components/common/CountdownTimer.vue'))

const props = defineProps<{
  taskData: Task | null
  participationInfo: TaskParticipationInfo | null
}>()

const router = useRouter()

const formatTaskDate = (date: number | string | Date | undefined) => {
  if (!date) return '未设置'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const isDeadlineSoon = (date: number | string | Date | undefined) => {
  if (!date) return false
  const deadlineDate = dayjs(date)
  const now = dayjs()
  // 如果截止时间在3天内
  return deadlineDate.diff(now, 'day') <= 3 && deadlineDate.isAfter(now)
}

const isSelfTask = computed(() => {
  return props.taskData?.creator.id === AccountService.user?.id
})

const taskDescription = computed(() => {
  try {
    return JSON.parse(props.taskData?.description ?? '{}')
  } catch (error) {
    return props.taskData?.description
  }
})

const rankStars = computed(() => {
  return props.taskData?.rank ? props.taskData.rank : 0
})

const taskUserDeadline = computed(() => {
  return props.taskData?.userDeadline
})

const isDeadlinePassed = computed(() => {
  if (!props.taskData?.deadline) return false
  return dayjs(props.taskData.deadline).isBefore(dayjs())
})

const joinRejectReasonText = computed(() => {
  switch (props.taskData?.joinRejectReason) {
    case 'YourRankIsNotHighEnoughError':
      return '您当前的等级不足以参与此题目'
    case 'AlreadyBeTaskParticipantError':
      return '您已经参与了此题目'
    case 'RealNameInfoRequiredError':
      return '此题目需要实名认证后才能参与'
    case 'TaskParticipantsReachedLimitError':
      return '该题目参与人数已达到上限'
    default:
      return '暂时无法参与此题目'
  }
})

const goToAIAdvice = () => {
  if (props.taskData) {
    router.push({
      name: 'TasksAIAdvice',
      params: { taskId: props.taskData.id },
    })
  }
}
</script>

<style scoped>
.task-description {
  font-size: 1rem;
  line-height: 1.6;
}

.task-detail-card,
.task-info-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(var(--v-theme-primary), 0.03) !important;
}

.task-detail-card:hover,
.task-info-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.05) !important;
}

.gradient-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.15) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.gradient-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
