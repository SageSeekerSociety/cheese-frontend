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

    <!-- 个人任务参与限制提示 -->
    <v-alert
      v-if="
        taskData?.submitterType === 'USER' &&
        !canUserJoin &&
        !taskData?.joined &&
        userReasons.length > 0 &&
        !isDeadlinePassed
      "
      type="warning"
      class="mb-4"
      rounded="lg"
      title="暂时无法参与"
    >
      <template #text>
        <div class="mt-2">
          <div class="font-weight-medium">{{ userReasons[0]?.message || '您当前无法参与此赛题' }}</div>

          <!-- 等级不足提示 -->
          <div v-if="userReasons[0]?.code === 'USER_RANK_NOT_HIGH_ENOUGH'" class="mt-2 text-medium-emphasis">
            完成更多基础题目来提升您的等级，解锁更高难度的挑战。
          </div>

          <!-- 缺少实名信息提示 -->
          <div v-if="userReasons[0]?.code === 'USER_MISSING_REAL_NAME'" class="mt-2 text-medium-emphasis">
            <div class="d-flex align-center gap-2">
              <span>此赛题需要提供实名信息才能参与。</span>
              <v-btn color="primary" variant="tonal" size="small" :to="{ name: 'ProfileVerification' }">
                前往验证
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- 人数已满提示 -->
          <div v-if="userReasons[0]?.code === 'PARTICIPANT_LIMIT_REACHED'" class="mt-2 text-medium-emphasis">
            该赛题参与名额已满，请关注其他赛题。
          </div>
        </div>
      </template>
    </v-alert>

    <!-- 小队任务参与限制提示 -->
    <v-alert
      v-if="taskData?.submitterType === 'TEAM' && !canUserJoin && !taskData?.joined && !isDeadlinePassed"
      type="warning"
      class="mb-4"
      rounded="lg"
      title="小队不满足参与条件"
    >
      <template #text>
        <div class="mt-2">
          <!-- 没有小队的情况 -->
          <div v-if="noTeams" class="font-weight-medium">
            您需要创建或加入一个小队才能参与此赛题
            <div class="mt-2 d-flex align-center">
              <v-btn color="primary" variant="tonal" size="small" :to="{ name: 'TeamsIndex' }">
                前往管理我的小队
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- 有小队但都不符合条件的情况 -->
          <div v-else-if="hasTeamsButNoneEligible" class="font-weight-medium">
            您有 {{ teamCount }} 个小队，但没有符合条件的小队可以参与此赛题

            <v-expansion-panels variant="accordion" class="mt-3">
              <v-expansion-panel v-for="teamEligibility in teamEligibilityList" :key="teamEligibility.team.id">
                <v-expansion-panel-title class="py-2">
                  <div class="d-flex align-center">
                    <v-avatar size="24" class="mr-2">
                      <v-img
                        v-if="teamEligibility.team.avatarId"
                        :src="getAvatarUrl(teamEligibility.team.avatarId)"
                        alt="小队头像"
                      ></v-img>
                      <v-icon v-else>mdi-account-group</v-icon>
                    </v-avatar>
                    <span>{{ teamEligibility.team.name }}</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div v-for="(reason, index) in teamEligibility.eligibility.reasons" :key="index" class="mb-2">
                    <div class="font-weight-medium">
                      <v-icon color="warning" size="small" class="mr-1">mdi-alert-circle</v-icon>
                      {{ reason.message }}
                    </div>

                    <!-- 团队人数不满足要求 -->
                    <div v-if="reason.code === 'TEAM_SIZE_MIN_NOT_MET'" class="mt-1 text-medium-emphasis">
                      此赛题要求小队最少 {{ taskData.minTeamSize }} 人，请邀请更多成员加入您的小队。
                    </div>
                    <div v-if="reason.code === 'TEAM_SIZE_MAX_EXCEEDED'" class="mt-1 text-medium-emphasis">
                      此赛题要求小队最多 {{ taskData.maxTeamSize }} 人，您的小队人数超出限制。
                    </div>

                    <!-- 团队成员缺少实名信息 -->
                    <div v-if="reason.code === 'TEAM_MEMBER_MISSING_REAL_NAME'" class="mt-1">
                      <p class="text-medium-emphasis mb-2">
                        小队中有成员尚未提供实名信息，请通知相关成员完成实名验证。
                      </p>

                      <v-list
                        v-if="teamEligibility.team.memberRealNameStatus"
                        density="compact"
                        class="bg-grey-lighten-5 rounded-lg pa-0 mb-2"
                      >
                        <v-list-subheader class="text-caption font-weight-medium"
                          >未完成实名验证的成员：</v-list-subheader
                        >
                        <v-list-item
                          v-for="member in teamEligibility.team.memberRealNameStatus.filter((m) => !m.hasRealNameInfo)"
                          :key="member.memberId"
                          density="compact"
                          class="py-1"
                        >
                          <template #prepend>
                            <v-icon size="small" color="error" class="mr-2">mdi-account-alert</v-icon>
                          </template>
                          <v-list-item-title class="text-body-2">{{ member.userName }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </div>

                    <!-- 团队成员等级不足 -->
                    <div v-if="reason.code === 'TEAM_MEMBER_RANK_NOT_HIGH_ENOUGH'" class="mt-1 text-medium-emphasis">
                      小队中有成员等级不足，无法参与此难度的赛题。
                    </div>
                  </div>

                  <v-btn
                    color="primary"
                    variant="tonal"
                    size="small"
                    class="mt-2"
                    :to="{ name: 'TeamsDetailMembers', params: { teamId: teamEligibility.team.id } }"
                  >
                    管理此小队
                    <v-icon end>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <!-- 非小队原因导致的限制 -->
          <div v-else-if="userReasons.length > 0" class="font-weight-medium">
            {{ userReasons[0]?.message || '您当前无法参与此赛题' }}

            <!-- 根据不同原因显示不同提示 -->
            <div v-if="userReasons[0]?.code === 'USER_RANK_NOT_HIGH_ENOUGH'" class="mt-2 text-medium-emphasis">
              完成更多基础题目来提升您的等级，解锁更高难度的挑战。
            </div>

            <div v-if="userReasons[0]?.code === 'PARTICIPANT_LIMIT_REACHED'" class="mt-2 text-medium-emphasis">
              该赛题参与名额已满，请关注其他赛题。
            </div>
          </div>
        </div>
      </template>
    </v-alert>

    <!-- AI建议入口卡片 -->
    <v-card flat rounded="lg" class="gradient-card cursor-pointer mb-4" elevation="0" @click="goToAIAdvice">
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

              <v-divider></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">
                  {{ taskData?.submitterType === 'TEAM' ? '队伍数量限制' : '参与者人数限制' }}
                </div>
                <div class="d-flex align-center">
                  <v-chip v-if="taskData?.participantLimit" color="primary" variant="flat">
                    {{ taskData.participantLimit }} {{ taskData?.submitterType === 'TEAM' ? '队' : '人' }}
                  </v-chip>
                  <span v-else class="text-primary font-weight-medium">不限</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 赛题详情 -->
    <v-card flat rounded="lg" class="mt-4 task-detail-card">
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
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskMembership, TeamTaskEligibility } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

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

const canUserJoin = computed(() => {
  if (!props.taskData) return false

  // 对于个人任务，检查用户是否可以参与
  if (props.taskData.submitterType === 'USER') {
    return !!props.taskData.participationEligibility?.user?.eligible
  } else {
    return !!props.taskData.participationEligibility?.teams?.some((team) => team.eligibility.eligible)
  }
})

const userReasons = computed(() => {
  return props.taskData?.participationEligibility?.user?.reasons || []
})

const teamEligibilityList = computed(() => {
  return props.taskData?.participationEligibility?.teams || []
})

const teamCount = computed(() => {
  return teamEligibilityList.value.length
})

const noTeams = computed(() => {
  return teamCount.value === 0
})

const hasTeamsButNoneEligible = computed(() => {
  return teamCount.value > 0 && !teamEligibilityList.value.some((team) => team.eligibility.eligible)
})

const showNoTeamAlert = computed(() => {
  // 已由上面的小队参与限制提示替代，不再需要单独显示
  return false
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
