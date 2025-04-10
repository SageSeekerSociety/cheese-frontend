<template>
  <!-- 编辑对话框 -->
  <v-dialog :model-value="editDialogOpen" fullscreen scrollable @update:model-value="handleCloseEdit">
    <v-card>
      <v-toolbar color="primary" dark>
        <v-btn icon @click="handleCloseEdit">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>编辑赛题</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <TaskForm
            v-if="taskData"
            :initial-data="editTaskData"
            :submit-button-text="'保存'"
            is-editing
            :classification-topics="taskData.space?.classificationTopics || []"
            @submit="handleSubmitEdit"
          />
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- 实名验证对话框 -->
  <v-dialog
    :model-value="verifyInfoDialogOpen"
    persistent
    max-width="600"
    class="verify-info-dialog"
    scrollable
    @update:model-value="handleCloseVerify"
  >
    <v-card rounded="lg" elevation="4">
      <v-card-title class="text-h5 pa-4 pb-2">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2" size="26">mdi-account-check</v-icon>
          {{ taskData?.requireRealName ? '实名参与确认' : '参与确认' }}
        </div>
      </v-card-title>
      <v-card-text class="pa-4 pt-2">
        <div class="text-body-1 mb-4">
          <template v-if="taskData?.requireRealName">
            此赛题要求实名参与。为确保赛题相关通知能够及时送达，同时便于身份认证和项目认证，请补充您的联系方式。
          </template>
          <template v-else> 为确保赛题相关通知能够及时送达，请至少提供一种联系方式。 </template>
        </div>

        <!-- 信息获取提示卡片 - 仅在需要实名时显示 -->
        <v-card
          v-if="taskData?.requireRealName"
          class="mb-4 info-alert-card"
          variant="flat"
          rounded="lg"
          color="grey-lighten-4"
        >
          <v-card-text class="pa-3">
            <div class="d-flex align-start">
              <v-avatar size="36" color="info" class="mr-3 info-avatar">
                <v-icon icon="mdi-account-details" color="white" size="20"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-medium mb-1">实名信息确认</div>
                <p class="text-body-2 mb-0">
                  您的真实姓名和学籍信息将从已认证的信息中获取。参与此赛题表示您同意向赛题组织者提供您的实名信息，用于身份验证和项目认证。
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-tooltip v-if="taskData?.teamLockingPolicy === 'LOCK_ON_APPROVAL'" location="top">
          <template #activator="{ props }">
            <v-card
              class="mb-4 info-alert-card cursor-pointer"
              variant="flat"
              rounded="lg"
              color="grey-lighten-4"
              v-bind="props"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center">
                  <v-avatar size="36" color="warning" class="mr-3 warning-avatar">
                    <v-icon icon="mdi-lock-check" color="white" size="18"></v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <span class="text-body-2"
                      >此赛题设置了<strong>审核通过后锁定</strong>策略，队伍一旦确认参与将无法变更成员
                    </span>
                  </div>
                  <v-icon size="small" color="info">mdi-information-outline</v-icon>
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <div class="text-subtitle-2 font-weight-medium mb-1">队伍成员锁定说明</div>
            <p class="text-body-2 mb-0">
              • 参与申请被审核通过后，队伍成员将被<strong>锁定</strong>，无法添加或移除成员<br />
              • 成员锁定将在任务完成后解除（提交被接受或赛题截止日期结束后）<br />
              • 系统将以审核通过时的队伍成员名单为准进行最终评估和认证
            </p>
          </div>
        </v-tooltip>

        <v-tooltip v-else-if="taskData?.submitterType === 'TEAM'" location="top">
          <template #activator="{ props }">
            <v-card
              class="mb-4 info-alert-card cursor-pointer"
              variant="flat"
              rounded="lg"
              color="grey-lighten-4"
              v-bind="props"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center">
                  <v-avatar size="36" color="info" class="mr-3 info-avatar">
                    <v-icon icon="mdi-account-group" color="white" size="18"></v-icon>
                  </v-avatar>
                  <span class="text-body-2">系统将记录审核通过时的队伍成员名单，用于最终评估和证书发放</span>
                  <v-icon size="small" color="info" class="ms-auto">mdi-information-outline</v-icon>
                </div>
              </v-card-text>
            </v-card>
          </template>
          <div class="pa-2">
            <div class="text-subtitle-2 font-weight-medium mb-1">队伍成员管理说明</div>
            <p class="text-body-2 mb-0">
              • 系统会记录审核通过时的队伍成员名单，用于最终评估和证书发放<br />
              • 即使申请通过后可以调整队伍成员，但这些变动不会影响已记录的参与情况
            </p>
          </div>
        </v-tooltip>

        <VerifyInfoFormComponent
          ref="verifyInfoFormRef"
          data-role="verify-info-form"
          :require-real-name="taskData?.requireRealName ?? false"
          @submit="handleSubmitVerify"
        />
        <div class="privacy-consent">
          <v-checkbox
            v-if="taskData?.requireRealName"
            v-model="privacyAgreedProxy"
            color="primary"
            hide-details
            class="privacy-checkbox"
            density="compact"
          >
            <template #label>
              <div class="d-flex align-center">
                <span>
                  我已阅读并理解
                  <span class="text-primary font-weight-medium privacy-link" @click.stop.prevent="directShowPrivacy">
                    隐私保护声明
                  </span>
                </span>
                <v-tooltip location="end" max-width="300">
                  <template #activator="{ props }">
                    <v-icon size="small" color="primary" class="ms-1" v-bind="props"> mdi-information-outline </v-icon>
                  </template>
                  <span>您的实名信息和联系方式仅供赛题组织者查看，受到严格保护</span>
                </v-tooltip>
              </div>
            </template>
          </v-checkbox>
        </div>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn @click="handleCloseVerify">取消</v-btn>
        <v-btn variant="flat" color="primary" @click="submitVerifyForm">确认参与</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 隐私声明对话框 -->
  <v-dialog
    v-if="taskData?.requireRealName"
    :model-value="privacyDialogOpen"
    max-width="560"
    scrollable
    @update:model-value="handleCancelPrivacy"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center px-4 pt-4 pb-2">
        <v-icon color="primary" class="mr-3" size="28">mdi-shield-check</v-icon>
        <span class="text-h5 font-weight-medium">实名信息隐私保护</span>
      </v-card-title>

      <v-card-text class="px-4 pb-2">
        <p class="text-subtitle-2 font-weight-medium mb-4">我们重视您的隐私安全，并采取多重措施保护您的实名信息：</p>

        <!-- 隐私信息保护区域 -->
        <PrivacyProtectionInfo />
      </v-card-text>

      <v-card-actions class="pa-4 pt-2">
        <v-spacer></v-spacer>
        <v-btn v-if="!fromSubmit" color="secondary" variant="text" @click="handleCancelPrivacy">我已了解</v-btn>
        <template v-else>
          <v-btn variant="text" @click="handleCancelPrivacy">暂不参与</v-btn>
          <v-btn color="primary" variant="flat" @click="confirmPrivacy">同意并参与</v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- AI 对话框组件 -->
  <AIAdviceChatDialog
    ref="chatDialogRef"
    :model-value="chatDialogOpen"
    :task-id="taskData?.id || 0"
    :context="selectedContext"
    @update:model-value="handleCloseChat"
    @clear-context="handleClearContext"
  />

  <!-- 新增队伍选择对话框 -->
  <TeamSelectionDialog
    :open="teamSelectionDialogOpen"
    :task-data="taskData"
    :available-teams="availableTeams"
    :loading="loadingTeams"
    @close="handleCloseTeamSelection"
    @select="handleSelectTeam"
  />

  <!-- 退出小队对话框 -->
  <LeaveTeamDialog
    :open="leaveTeamDialogOpen"
    :task-data="taskData"
    :loading="loadingTeams"
    :joined-teams="joinedTeams"
    :selected-team-id="selectedLeaveTeamId"
    @close="handleCancelLeaveTeam"
    @select="handleSelectLeaveTeam"
    @confirm="handleConfirmLeaveTeam"
  />
</template>

<script setup lang="ts">
import type { TaskAIAdviceConversationContext } from '@/network/api/tasks/types'
import type { Task, Team, TeamTaskEligibility } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'

import { useEvents } from '../events'

// 组件
const TaskForm = defineAsyncComponent(() => import('@/components/tasks/TaskForm.vue'))
const VerifyInfoFormComponent = defineAsyncComponent(() => import('@/components/tasks/VerifyInfoForm.vue'))
const AIAdviceChatDialog = defineAsyncComponent(() => import('@/components/tasks/AIAdviceChatDialog.vue'))
const PrivacyProtectionInfo = defineAsyncComponent(() => import('./PrivacyProtectionInfo.vue'))
const TeamSelectionDialog = defineAsyncComponent(() => import('./TeamSelectionDialog.vue'))
const LeaveTeamDialog = defineAsyncComponent(() => import('./LeaveTeamDialog.vue'))

// 只保留必要的props
const props = defineProps<{
  taskData: Task | null
  editTaskData: any
  availableTeams: TeamTaskEligibility[]
  loadingTeams: boolean
  joinedTeams: Team[]
  selectedLeaveTeamId: number | null
  selectedContext: TaskAIAdviceConversationContext | undefined
  participationInfo: any
}>()

// 使用事件总线
const events = useEvents()

// 各种对话框的状态
const editDialogOpen = ref(false)
const verifyInfoDialogOpen = ref(false)
const privacyDialogOpen = ref(false)
const chatDialogOpen = ref(false)
const teamSelectionDialogOpen = ref(false)
const leaveTeamDialogOpen = ref(false)
const privacyAgreed = ref(false)
const fromSubmit = ref(false)

// 组件引用
const verifyInfoFormRef = ref<InstanceType<typeof VerifyInfoFormComponent> | null>(null)
const chatDialogRef = ref<InstanceType<typeof AIAdviceChatDialog> | null>(null)

// 监听对话框状态变化
onMounted(() => {
  events.on('edit-dialog-open', (value) => {
    editDialogOpen.value = value
  })

  events.on('verify-dialog-open', (value) => {
    verifyInfoDialogOpen.value = value
  })

  events.on('privacy-dialog-open', (value) => {
    privacyDialogOpen.value = value
  })

  events.on('chat-dialog-open', ({ status, question }) => {
    chatDialogOpen.value = status
    if (question) {
      chatDialogRef.value?.sendMessage(question)
    }
  })

  events.on('team-selection-dialog-open', (value) => {
    teamSelectionDialogOpen.value = value
  })

  events.on('leave-team-dialog-open', (value) => {
    leaveTeamDialogOpen.value = value
  })

  events.on('show-privacy', () => {
    privacyDialogOpen.value = true
  })

  events.on('privacy-agreed-change', (value) => {
    privacyAgreed.value = value
  })

  events.on('set-from-submit', (value) => {
    fromSubmit.value = value
  })
})

const privacyAgreedProxy = computed({
  get: () => privacyAgreed.value,
  set: (value) => {
    if (privacyAgreed.value !== value) {
      privacyAgreed.value = value
      events.emit('privacy-agreed-change', value)
    }
  },
})

// 提交表单
const submitVerifyForm = async () => {
  console.log('提交表单', props.taskData?.requireRealName, privacyAgreedProxy.value)
  // 如果需要实名并且没有同意隐私协议，先弹出隐私协议
  if (props.taskData?.requireRealName && !privacyAgreedProxy.value) {
    console.log('需要先同意隐私协议')
    events.emit('show-privacy', undefined)
    events.emit('set-from-submit', true)
    fromSubmit.value = true
    return
  }

  // 已同意隐私协议或不需要实名，直接提交
  if (verifyInfoFormRef.value) {
    console.log('提交表单', verifyInfoFormRef.value)
    verifyInfoFormRef.value.submit()
  } else {
    console.error('找不到有效的表单引用')
  }
}

// 处理表单提交
const handleSubmitVerify = (data: any) => {
  events.emit('submit-verify', data)
  verifyInfoDialogOpen.value = false
}

// 处理编辑提交
const handleSubmitEdit = (data: any) => {
  events.emit('submit-edit', data)
  editDialogOpen.value = false
}

// 确认隐私协议
const confirmPrivacy = () => {
  events.emit('confirm-privacy', { fromSubmit: fromSubmit.value })
  privacyAgreed.value = true
  privacyDialogOpen.value = false

  // 如果是从提交按钮触发的，在隐私对话框关闭后继续提交表单
  if (fromSubmit.value) {
    setTimeout(() => {
      if (verifyInfoFormRef.value) {
        verifyInfoFormRef.value.submit()
      }
    }, 300)
  }
}

// 处理对话框关闭事件
const handleCloseEdit = () => {
  editDialogOpen.value = false
  events.emit('edit-dialog-open', false)
}

const handleCloseVerify = () => {
  verifyInfoDialogOpen.value = false
  events.emit('verify-dialog-open', false)
}

const handleCancelPrivacy = () => {
  privacyDialogOpen.value = false
  fromSubmit.value = false
  events.emit('cancel-privacy', undefined)
}

const handleCloseChat = (value: boolean) => {
  chatDialogOpen.value = value
  events.emit('chat-dialog-open', { status: value })
}

const handleCloseTeamSelection = () => {
  teamSelectionDialogOpen.value = false
  events.emit('team-selection-dialog-open', false)
}

const handleCancelLeaveTeam = () => {
  leaveTeamDialogOpen.value = false
  events.emit('leave-team-dialog-open', false)
}

const handleSelectTeam = (teamId: number) => {
  events.emit('select-team', teamId)
}

const handleSelectLeaveTeam = (teamId: number) => {
  events.emit('select-leave-team', teamId)
}

const handleConfirmLeaveTeam = () => {
  events.emit('confirm-leave-team', undefined)
  leaveTeamDialogOpen.value = false
}

const handleClearContext = () => {
  events.emit('clear-context', undefined)
}

// 直接显示隐私声明
const directShowPrivacy = () => {
  events.emit('show-privacy', undefined)
  privacyDialogOpen.value = true
}
</script>

<style scoped>
.info-alert-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  transition: all 0.2s ease;
}

.info-avatar {
  background: linear-gradient(135deg, rgb(var(--v-theme-info)), rgb(var(--v-theme-info)));
  box-shadow: 0 2px 4px rgba(var(--v-theme-info), 0.2);
}

.warning-avatar {
  background: linear-gradient(135deg, rgb(var(--v-theme-warning)), rgb(var(--v-theme-warning)));
  box-shadow: 0 2px 4px rgba(var(--v-theme-warning), 0.2);
}

.privacy-link {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px dashed rgba(var(--v-theme-primary), 0.5);
}

.privacy-link:hover {
  border-bottom-color: rgb(var(--v-theme-primary));
  opacity: 0.9;
}

.privacy-checkbox :deep(.v-label) {
  opacity: 1;
}

.verify-info-dialog :deep(.v-card) {
  overflow: hidden;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
