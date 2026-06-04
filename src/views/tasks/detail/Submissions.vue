<template>
  <div>
    <v-card flat rounded="lg">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-icon color="primary" size="28">mdi-file-document-multiple</v-icon>
          </div>
        </template>
        <v-card-title class="text-h6 ps-0">提交记录</v-card-title>
        <template #append>
          <div class="d-flex align-center gap-2">
            <v-select
              v-if="showIdentitySelect && identityOptions.length > 1"
              v-model="selectedIdentity"
              :items="identityOptions"
              label="查看身份"
              hide-details
              variant="outlined"
              density="compact"
              class="max-width-200"
            ></v-select>
          </div>
        </template>
      </v-card-item>

      <v-divider class="mb-2"></v-divider>

      <v-card-text class="px-4 pb-6">
        <TaskSubmissionHistory
          v-if="taskData && currentParticipantId"
          :task-id="taskData.id"
          :participant-id="currentParticipantId"
          :reviewable="false"
          hide-title
          :highlight-latest="true"
          :outlined="false"
          empty-text="暂无提交记录"
        />
      </v-card-text>
    </v-card>

    <v-card v-if="taskData?.resubmittable && canSubmit" flat rounded="lg" class="mt-6">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-icon color="info" size="28">mdi-information-outline</v-icon>
          </div>
        </template>
        <v-card-title class="text-h6 ps-0">提交须知</v-card-title>
      </v-card-item>

      <v-card-text>
        <div class="d-flex flex-column gap-4">
          <div class="d-flex align-start gap-2">
            <v-icon color="primary" class="mt-1">mdi-check-circle</v-icon>
            <div>
              <div class="font-weight-medium">可重复提交</div>
              <div class="text-medium-emphasis">该赛题允许您多次提交作品，系统将保存所有提交记录</div>
            </div>
          </div>

          <div class="d-flex align-start gap-2">
            <v-icon color="primary" class="mt-1">mdi-clock-outline</v-icon>
            <div>
              <div class="font-weight-medium">截止时间</div>
              <div class="text-medium-emphasis">请在提交截止时间前完成您的最终提交</div>
            </div>
          </div>

          <div class="d-flex justify-center mt-2">
            <v-btn
              color="primary"
              rounded="pill"
              :to="{ name: 'TasksSubmit', params: { taskId: taskData.id } }"
              class="px-8"
            >
              前往提交
              <v-icon end>mdi-upload</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { TaskParticipationIdentity, TaskParticipationInfo } from '@/network/api/tasks/types'
import type { Task } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'

import { TasksApi } from '@/network/api/tasks'
import AccountService from '@/services/account'

const TaskSubmissionHistory = defineAsyncComponent(() => import('@/components/tasks/TaskSubmissionHistory.vue'))

const props = defineProps<{
  taskData: Task | null
  isCreator?: boolean
  isAdmin?: boolean
  participationInfo?: TaskParticipationInfo
}>()

// 状态
const selectedIdentity = ref<number | null>(null)
const participants = ref<any[]>([])

// 计算属性
const isCreator = computed(() => props.isCreator || AccountService.user?.id === props.taskData?.creator.id)
const isAdmin = computed(
  () =>
    props.isAdmin || (props.taskData?.space?.admins || []).some((admin) => admin.user.id === AccountService.user?.id)
)

// 获取可供选择的身份选项
const identityOptions = computed(() => {
  if (!props.participationInfo?.identities.length) return []

  // 将所有身份转换为选择项
  return props.participationInfo.identities.map((identity) => {
    let title = identity.type === 'TEAM' ? `队伍: ${identity.teamName || '未命名队伍'}` : '个人参与'

    if (identity.approved !== 'APPROVED') {
      const statusText = identity.approved === 'NONE' ? '(待审核)' : '(已驳回)'
      title = `${title} ${statusText}`
    }

    return {
      title,
      value: identity.id,
      disabled: identity.approved !== 'APPROVED',
    }
  })
})

// 是否显示身份选择器
const showIdentitySelect = computed(() => {
  return props.participationInfo?.hasParticipation && props.participationInfo.identities.length > 0
})

// 计算当前查看的参与者ID
const currentParticipantId = computed(() => {
  // 如果用户选择了特定身份
  if (selectedIdentity.value) {
    return selectedIdentity.value
  }

  // 如果没有选择但有身份，使用第一个可提交的身份
  if (props.participationInfo?.identities.length) {
    const approvedIdentity = props.participationInfo.identities.find((i) => i.approved === 'APPROVED')
    if (approvedIdentity) {
      return approvedIdentity.id
    }
    // 如果没有已批准的身份，返回第一个身份
    return props.participationInfo.identities[0].id
  }

  // 如果是管理员或创建者，可以查看其他人
  if ((isAdmin.value || isCreator.value) && selectedIdentity.value) {
    return selectedIdentity.value
  }

  return null
})

// 是否可以提交
const canSubmit = computed(() => {
  if (!props.taskData?.submittable) return false

  // 如果没有参与信息，不能提交
  if (!props.participationInfo?.hasParticipation) return false

  // 检查是否有可以提交的身份
  return props.participationInfo.identities.some((identity) => identity.approved === 'APPROVED' && identity.canSubmit)
})

// 监听和生命周期
watch(
  () => props.participationInfo,
  (newVal) => {
    if (newVal?.identities.length) {
      // 默认选择第一个已批准的身份
      const approvedIdentity = newVal.identities.find((i) => i.approved === 'APPROVED')
      if (approvedIdentity) {
        selectedIdentity.value = approvedIdentity.id
      } else {
        selectedIdentity.value = newVal.identities[0].id
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.participationInfo?.identities.length) {
    // 默认选择第一个已批准的身份
    const approvedIdentity = props.participationInfo.identities.find((i) => i.approved === 'APPROVED')
    if (approvedIdentity) {
      selectedIdentity.value = approvedIdentity.id
    } else {
      selectedIdentity.value = props.participationInfo.identities[0].id
    }
  }
})
</script>

<style scoped>
.max-width-200 {
  max-width: 200px;
}

@media (max-width: 600px) {
  .max-width-200 {
    max-width: 100%;
  }
}
</style>
