<template>
  <v-container>
    <v-row dense>
      <v-col cols="12">
        <div class="d-flex flex-column flex-md-row align-start align-md-center gap-4 mb-4">
          <v-breadcrumbs v-if="breadcrumbItems" :items="breadcrumbItems" density="compact" class="pa-0">
            <template #prepend>
              <v-icon>mdi-cheese</v-icon>
            </template>
          </v-breadcrumbs>
          <div class="flex-grow-1 d-none d-md-block"></div>
          <v-menu v-if="viewRoles.length > 1">
            <template #activator="{ props }">
              <div class="d-flex flex-row align-center text-medium-emphasis flex-shrink-0">
                <v-icon left size="24" class="mr-2">mdi-eye</v-icon>
                <span>正在以</span>
                <v-btn v-bind="props" variant="text" color="text" density="comfortable" class="px-2 mx-2">
                  {{ currentViewRoleTitle }}
                  <v-icon right size="24">mdi-chevron-down</v-icon>
                </v-btn>
                <span>视角查看</span>
              </div>
            </template>
            <v-list color="primary">
              <v-list-item
                v-for="role in viewRoles.filter(
                  (role) => role.type === 'participant' || role.type === 'creator' || role.type === 'space-admin'
                )"
                :key="role.value"
                :value="role.value"
                :active="selectedViewRole === role.value"
                @click="switchViewRole(role.value)"
              >
                <template #prepend>
                  <v-avatar size="32" class="position-relative">
                    <v-img :src="getAvatarUrl(AccountService.user?.avatarId)" />
                    <v-icon
                      v-if="selectedViewRole === role.value"
                      color="white"
                      class="position-absolute selected-view-role-icon"
                    >
                      mdi-check-circle
                    </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ role.title }}</v-list-item-title>
                <template #append>
                  <v-icon>{{ role.icon }}</v-icon>
                </template>
              </v-list-item>

              <v-list-subheader v-if="viewRoles.some((role) => role.type === 'team' && !role.isSubmittable)">
                可参与的小队
              </v-list-subheader>
              <v-list-item
                v-for="role in viewRoles.filter((role) => role.type === 'team' && !role.isSubmittable)"
                :key="role.value"
                :value="role.value"
                :active="selectedViewRole === role.value"
                @click="switchViewRole(role.value)"
              >
                <template #prepend>
                  <v-avatar size="32" class="position-relative">
                    <v-img v-if="role.avatarId" :src="getAvatarUrl(role.avatarId)" />
                    <v-icon v-else>{{ role.icon }}</v-icon>
                    <v-icon
                      v-if="selectedViewRole === role.value"
                      color="white"
                      class="position-absolute selected-view-role-icon"
                    >
                      mdi-check-circle
                    </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ role.title }}</v-list-item-title>
                <template #append>
                  <v-icon>mdi-lock-open</v-icon>
                </template>
              </v-list-item>

              <v-list-subheader v-if="viewRoles.some((role) => role.type === 'team' && role.isSubmittable)">
                可提交的小队
              </v-list-subheader>
              <v-list-item
                v-for="role in viewRoles.filter((role) => role.type === 'team' && role.isSubmittable)"
                :key="role.value"
                :value="role.value"
                :active="selectedViewRole === role.value"
                @click="switchViewRole(role.value)"
              >
                <template #prepend>
                  <v-avatar size="32" class="position-relative">
                    <v-img v-if="role.avatarId" :src="getAvatarUrl(role.avatarId)" />
                    <v-icon v-else>{{ role.icon }}</v-icon>
                    <v-icon
                      v-if="selectedViewRole === role.value"
                      color="white"
                      class="position-absolute selected-view-role-icon"
                    >
                      mdi-check-circle
                    </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ role.title }}</v-list-item-title>
                <template #append>
                  <v-icon>mdi-upload</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <v-sheet v-if="taskData" flat rounded="lg" class="pa-4">
          <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between">
            <div>
              <div class="text-h6">
                <v-icon left size="24" class="text-primary mr-1">mdi-trophy</v-icon>
                {{ taskData?.name }}
              </div>
              <div class="text-subtitle-1 text-medium-emphasis">
                {{ taskData?.creator.nickname }} 发布于 {{ dayjs(taskData?.createdAt).format('YYYY-MM-DD HH:mm') }}
              </div>
              <div class="d-flex flex-row align-center" style="gap: 4px">
                <v-chip :color="taskStatusType">{{ taskStatusText }}</v-chip>
                <v-chip color="primary" variant="tonal">{{
                  taskData?.submitterType === 'USER' ? '个人任务' : '小队任务'
                }}</v-chip>
                <v-chip v-if="taskData?.resubmittable" variant="tonal">可重复提交</v-chip>
              </div>
            </div>
            <div class="flex-shrink-0 d-flex flex-row align-center ga-4 mt-4 mt-md-0 flex-wrap flex-md-nowrap">
              <template v-if="currentJoinable">
                <div v-if="taskData?.deadline" class="text-center">
                  <CountdownTimer :deadline="taskData.deadline" label="报名剩余时间" />
                </div>
                <v-btn color="primary" variant="flat" @click="onJoinTaskClicked">领取赛题</v-btn>
              </template>
              <template v-else-if="currentJoined">
                <v-btn color="error" variant="flat" @click="leaveTask">退出赛题</v-btn>
              </template>
              <template v-else-if="currentManageable">
                <v-btn-group color="primary" density="compact" variant="flat" rounded="lg" divided>
                  <v-btn class="pe-2" prepend-icon="mdi-pencil" @click="openEditDialog">
                    <div class="text-none font-weight-regular">编辑赛题</div>
                  </v-btn>

                  <v-btn icon @click="deleteTask">
                    <v-icon icon="mdi-delete"></v-icon>
                  </v-btn>
                </v-btn-group>
              </template>
            </div>
          </div>
          <v-alert
            v-if="taskData?.approved === 'DISAPPROVED' && isSelfTask"
            type="error"
            class="mt-4"
            title="审核未通过"
          >
            理由：{{ taskData.rejectReason }}
          </v-alert>
          <v-divider class="my-4" />
          <div class="text-body-1">
            <collapsible-content :max-height="200">
              <TipTapViewer :value="taskDescription" />
            </collapsible-content>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <template v-if="currentSubmittable">
      <v-row dense>
        <v-col cols="12">
          <TaskSubmissionHistory
            v-if="currentMember"
            ref="submissionHistoryRef"
            :task-id="Number(route.params.taskId)"
            :member-id="currentMember"
          />
        </v-col>
        <v-col cols="12">
          <v-card v-if="taskData" flat rounded="lg">
            <template #title>
              <v-icon left size="24">mdi-upload</v-icon>
              提交
            </template>

            <template #text>
              <CountdownTimer
                v-if="currentDeadline"
                :deadline="currentDeadline"
                label="提交剩余时间"
                class="mx-auto mb-4"
              />
              <v-form>
                <template v-for="(entry, index) in taskData.submissionSchema" :key="index">
                  <template v-if="entry.type === 'TEXT'">
                    <v-text-field
                      v-model="submissionContent[index].contentText"
                      :label="entry.prompt"
                      variant="outlined"
                    ></v-text-field>
                  </template>
                  <template v-else-if="entry.type === 'FILE'">
                    <v-file-input
                      v-model="submissionContent[index].contentAttachment"
                      :label="entry.prompt"
                      variant="outlined"
                    ></v-file-input>
                  </template>
                </template>
                <div class="d-flex justify-end">
                  <v-btn prepend-icon="mdi-check" color="primary" @click="submitTask">提交</v-btn>
                </div>
              </v-form>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <template v-else-if="currentJoined">
      <v-row dense>
        <v-col cols="12">
          <v-alert
            v-if="currentApproveStatus === 'NONE' || currentApproveStatus === 'REJECTED'"
            :type="currentApproveStatusType"
            rounded="lg"
            :title="currentApproveStatusText"
            :text="currentApproveStatusDescription"
          >
          </v-alert>
        </v-col>
      </v-row>
    </template>

    <template v-if="currentManageable">
      <v-row dense>
        <v-col cols="12">
          <v-card flat rounded="lg">
            <template #title>
              <v-icon left size="24">mdi-account-group</v-icon>
              参与者列表
            </template>
            <template #text>
              <v-list v-if="participants.length > 0">
                <v-list-item v-for="participant in participants" :key="participant.id">
                  <template #prepend>
                    <v-avatar
                      v-if="!participant.realNameInfo?.realName"
                      color="primary"
                      size="36"
                      :image="getAvatarUrl(participant.member.avatarId)"
                    ></v-avatar>
                    <v-avatar v-else>
                      <v-icon size="24">mdi-account</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    <div class="d-flex flex-row align-center gap-2">
                      <span>{{ getParticipantName(participant) }}</span>
                      <v-chip v-if="participant.approved === 'NONE'" variant="tonal" color="primary" density="compact">
                        待审核
                      </v-chip>
                      <v-chip
                        v-else-if="participant.approved === 'DISAPPROVED'"
                        variant="tonal"
                        color="error"
                        density="compact"
                      >
                        已驳回
                      </v-chip>
                    </div>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <template v-if="participant.realNameInfo?.realName">
                      <div class="d-flex align-center">
                        <v-icon size="16" class="me-1">mdi-school</v-icon>
                        {{ participant.realNameInfo.grade }}级 {{ participant.realNameInfo.className }}
                      </div>
                      <div v-if="participant.realNameInfo.phone" class="d-flex align-center ga-1">
                        <v-icon size="16">mdi-phone</v-icon>
                        {{ participant.realNameInfo.phone }}
                      </div>
                      <div v-if="participant.realNameInfo.email" class="d-flex align-center ga-1">
                        <v-icon size="16">mdi-email</v-icon>
                        {{ participant.realNameInfo.email }}
                      </div>
                      <div v-if="participant.realNameInfo.applyReason" class="d-flex align-center ga-1">
                        <v-icon size="16">mdi-text-box</v-icon>
                        申请理由：{{ participant.realNameInfo.applyReason }}
                      </div>
                    </template>
                    <template v-if="participant.deadline">
                      <div class="d-flex align-center text-primary ga-1">
                        <v-icon size="16">mdi-clock</v-icon>
                        提交截止时间：{{ dayjs(participant.deadline).fromNow() }}
                      </div>
                    </template>
                  </v-list-item-subtitle>

                  <template #append>
                    <template v-if="participant.approved === 'APPROVED'">
                      <v-btn variant="text" @click="showParticipantSubmissions(participant.id)"> 查看提交 </v-btn>
                    </template>
                    <template v-else-if="participant.approved === 'NONE'">
                      <div class="d-flex flex-row align-center gap-2">
                        <v-btn
                          prepend-icon="mdi-check"
                          variant="tonal"
                          color="success"
                          @click="approveParticipant(participant.member.id)"
                        >
                          通过
                        </v-btn>
                        <v-btn
                          prepend-icon="mdi-close"
                          variant="tonal"
                          color="error"
                          @click="rejectParticipant(participant.member.id)"
                        >
                          驳回
                        </v-btn>
                      </div>
                    </template>
                  </template>
                </v-list-item>
              </v-list>
              <v-empty-state v-else title="暂无参与者"></v-empty-state>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
  <v-dialog v-model="progressDialog" persistent max-width="300">
    <v-card>
      <v-card-title class="headline">上传进度</v-card-title>
      <v-card-text>
        <v-progress-linear :value="uploadProgress" height="10" color="primary"></v-progress-linear>
        <div class="text-center">{{ uploadProgress }}%</div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isSubmissionsDialogOpen" fullscreen scrollable>
    <v-card color="surface-light">
      <v-toolbar color="surface">
        <v-btn icon="mdi-close" @click="isSubmissionsDialogOpen = false"></v-btn>
        <v-toolbar-title v-if="selectedParticipant">
          {{ getParticipantName(selectedParticipant) }} 的提交记录
        </v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <TaskSubmissionHistory
            v-if="selectedParticipant"
            :task-id="Number(route.params.taskId)"
            :member-id="selectedParticipant?.member.id"
            :show-title="false"
            :reviewable="currentManageable"
          />
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="editDialogOpen" fullscreen scrollable>
    <v-card>
      <v-toolbar color="primary" dark>
        <v-btn icon @click="editDialogOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ t('tasks.detail.editTask') }}</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <TaskForm
            :initial-data="editTaskData"
            :submit-button-text="t('tasks.detail.save')"
            is-editing
            :classification-topics="taskData?.space?.classificationTopics || []"
            @submit="submitEditTask"
          />
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isVerifyInfoDialogOpen" persistent max-width="600">
    <v-card>
      <v-card-title>补充信息</v-card-title>
      <v-card-text>
        <div class="text-body-1 mb-4">
          为确保赛题顺利进行，请补充您的基本信息。主办方将审核信息并在必要时与您取得联系。所填信息仅用于本次赛题参与。
        </div>
        <VerifyInfoForm ref="verifyInfoFormRef" @submit="handleVerifyInfoSubmit" />
        <v-alert class="mt-4" type="info" color="primary" variant="tonal" title="隐私保护声明" icon="mdi-shield-check">
          我们始终致力于保护用户隐私：您提供的信息仅供赛题创建者查看，不会展示在公开页面，也不会与您的账号关联。您在平台上的其他活动依然是匿名的。
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="isVerifyInfoDialogOpen = false">取消</v-btn>
        <v-btn @click="verifyInfoFormRef?.submit()"> 提交 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { PatchTaskRequestData } from '@/network/api/tasks/types'
import type { Task, TaskMembership, TaskParticipantRealNameInfo, Team } from '@/types'

import { computed, nextTick, onMounted, onWatcherCleanup, reactive, ref, useTemplateRef, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import dayjs from 'dayjs'

import { truncateString } from '@/utils/form'
import { getAvatarUrl } from '@/utils/materials'
import { getTaskStatusText, getTaskStatusType } from '@/utils/tasks'
import { setTitle } from '@/utils/title'

import CollapsibleContent from '@/components/common/CollapsibleContent.vue'
import CountdownTimer from '@/components/common/CountdownTimer.vue'
import TipTapViewer from '@/components/common/Editor/TipTapViewer.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import TaskSubmissionHistory from '@/components/tasks/TaskSubmissionHistory.vue'
import VerifyInfoForm from '@/components/tasks/VerifyInfoForm.vue'
import { AttachmentsApi } from '@/network/api/attachments'
import { TasksApi } from '@/network/api/tasks'
import { TeamsApi } from '@/network/api/teams'
import { useDialog } from '@/plugins/dialog'
import AccountService from '@/services/account'

const dialogs = useDialog()

const route = useRoute()
const router = useRouter()

const myTeams = ref<Team[]>([])
const taskData = ref<Task | null>(null)
const submissionContent = ref<{ contentText?: string; contentAttachment?: File }[]>([])
const progressDialog = ref(false)
const uploadProgress = ref(0)
const submissionHistoryRef = useTemplateRef<typeof TaskSubmissionHistory>('submissionHistoryRef')
const participants = ref<TaskMembership[]>([])
const isSubmissionsDialogOpen = ref(false)
const selectedParticipant = ref<TaskMembership | null>(null)
const selectedViewRole = ref<'participant' | 'creator' | 'space-admin' | string>('participant')
const initialLoaded = ref(false)
const isVerifyInfoDialogOpen = ref(false)

const { t } = useI18n()

const getParticipantName = (participant: TaskMembership) => {
  if (participant.realNameInfo?.realName) {
    return `${participant.realNameInfo.realName} (${participant.realNameInfo.studentId})`
  }
  return participant.member.name
}

const fetchTaskDetail = async (taskId: number, clearSubmissionContent = true) => {
  const {
    data: { task },
  } = await TasksApi.detail(taskId)
  taskData.value = task
  if (clearSubmissionContent) {
    submissionContent.value = reactive(task.submissionSchema.map(() => ({})))
  }
}

const isCreator = computed(() => AccountService.user?.id === taskData.value?.creator.id)
const isSpaceAdminOrOwner = computed(() => {
  if (!taskData.value?.space) return false
  return taskData.value.space.admins.some((admin) => admin.user.id === AccountService.user?.id)
})
const taskStatusText = computed(() => getTaskStatusText(taskData.value))
const taskStatusType = computed(() => getTaskStatusType(taskData.value))

const isSelfTask = computed(() => {
  return taskData.value?.creator.id === AccountService.user?.id
})

const breadcrumbItems = computed(() => {
  if (taskData.value?.space) {
    return [
      { title: '知是', to: { name: 'HomeDefault' } },
      {
        title: truncateString(taskData.value?.space.name, 12),
        to: { name: 'SpacesDetail', params: { spaceId: taskData.value?.space.id } },
      },
      {
        title: truncateString(taskData.value?.name, 12),
        to: { name: 'TasksDetail', params: { taskId: taskData.value?.id } },
      },
    ]
  }
  return null
})

const currentApproveStatus = computed(() => {
  if (!taskData.value) return 'NONE'
  if (!currentJoined.value) return 'NOT_JOINED'
  if (taskData.value.submitterType === 'USER') {
    return taskData.value.joinedApproved ? 'APPROVED' : taskData.value.joinedDisapproved ? 'REJECTED' : 'NONE'
  } else if (taskData.value.submitterType === 'TEAM') {
    return taskData.value.joinedApprovedAsTeam?.some((team) => team.id === Number(selectedViewRole.value))
      ? 'APPROVED'
      : taskData.value.joinedDisapprovedAsTeam?.some((team) => team.id === Number(selectedViewRole.value))
        ? 'REJECTED'
        : 'NONE'
  }
  return 'NONE'
})

const currentApproveStatusType = computed(() => {
  if (currentApproveStatus.value === 'APPROVED') return 'success'
  if (currentApproveStatus.value === 'REJECTED') return 'error'
  return 'info'
})

const currentApproveStatusText = computed(() => {
  if (currentApproveStatus.value === 'APPROVED') return '审核通过'
  if (currentApproveStatus.value === 'REJECTED') return '审核未通过'
  return '审核中'
})

const currentApproveStatusDescription = computed(() => {
  if (currentApproveStatus.value === 'NONE') return '请耐心等待审核结果，审核通过后即可提交。'
  return undefined
})

const currentDeadline = computed(() => {
  if (!taskData.value) return null
  if (currentViewRole.value?.type === 'participant') {
    if (taskData.value.submitterType === 'USER') {
      return participants.value.find((p) => p.member.id === AccountService.user?.id)?.deadline
    } else {
      return participants.value.find((p) => p.member.id === Number(selectedViewRole.value))?.deadline
    }
  }
  return null
})

const currentMember = computed(() => {
  if (selectedViewRole.value === 'creator' || selectedViewRole.value === 'participant') {
    return AccountService.user?.id
  } else {
    return Number(selectedViewRole.value)
  }
})

const taskDescription = computed(() => {
  try {
    return JSON.parse(taskData.value?.description ?? '{}')
  } catch (error) {
    return taskData.value?.description
  }
})

const fetchParticipants = async (queryRealNameInfo = false) => {
  if (!taskData.value) return
  const { data } = await TasksApi.getParticipants(taskData.value.id, { queryRealNameInfo })
  participants.value = data.participants
}

const fetchMyTeams = async () => {
  const { data } = await TeamsApi.getMyTeams()
  myTeams.value = data.teams
}

const showParticipantSubmissions = async (participantId: number) => {
  selectedParticipant.value = participants.value.find((p) => p.id === participantId) || null
  if (selectedParticipant.value && taskData.value) {
    isSubmissionsDialogOpen.value = true
  }
}

const refresh = async () => {
  await Promise.all([fetchTaskDetail(Number(route.params.taskId)), fetchMyTeams()])
  nextTick(() => {
    setTitle(taskData.value?.name || '赛题', route)
    fetchParticipants(currentManageable.value)
  })
}

onMounted(async () => {
  await refresh()
})

const switchViewRole = (role: string) => {
  selectedViewRole.value = role
  refresh()
}

const submitTask = async () => {
  if (!currentMember.value) {
    toast.error('请选择提交小队')
    return
  }
  const member = currentMember.value

  progressDialog.value = true
  uploadProgress.value = 0

  const totalFiles = submissionContent.value.filter((item) => item.contentAttachment).length
  let uploadedFiles = 0
  const finalSubmissionContent = submissionContent.value.map((item) => {
    if (item.contentAttachment) {
      return {} as { contentText?: string; contentAttachmentId?: number }
    }
    return {
      contentText: item.contentText,
    } as { contentText?: string; contentAttachmentId?: number }
  })

  for (const [index, entry] of submissionContent.value.entries()) {
    if (entry.contentAttachment) {
      try {
        const { data } = await AttachmentsApi.upload({
          type: 'file',
          file: entry.contentAttachment,
        })
        finalSubmissionContent[index].contentAttachmentId = data.id
        uploadedFiles++
        uploadProgress.value = Math.round((uploadedFiles / totalFiles) * 100)
      } catch (error) {
        toast.error('上传附件失败')
        progressDialog.value = false
        return
      }
    }
  }

  try {
    await TasksApi.createSubmission(taskData.value!.id, member, finalSubmissionContent)
    toast.success('提交成功')
    submissionHistoryRef.value?.refresh()
  } catch (error) {
    toast.error(`提交失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    progressDialog.value = false
  }

  await fetchTaskDetail(taskData.value!.id, true)
}

const onJoinTaskClicked = () => {
  isVerifyInfoDialogOpen.value = true
}

// 补全 realNameInfo 中不存在的字段为空字符
const fillRealNameInfo = (realNameInfo: TaskParticipantRealNameInfo) => {
  return {
    major: '',
    email: '',
    phone: '',
    applyReason: '',
    personalAdvantage: '',
    remark: '',
    ...realNameInfo,
  }
}

const joinTask = async (realNameInfo?: TaskParticipantRealNameInfo) => {
  if (!taskData.value) return
  if (!currentMember.value) {
    toast.error('无法获取成员信息')
    return
  }
  try {
    await TasksApi.addParticipant(taskData.value.id, currentMember.value, {
      deadline: null,
      realNameInfo: realNameInfo ? fillRealNameInfo(realNameInfo) : undefined,
    })
    toast.success('领取赛题成功')
    await fetchTaskDetail(taskData.value.id, false)
  } catch (error) {
    toast.error('领取赛题失败')
  }
}

const leaveTask = async () => {
  const confirm = await dialogs.confirm('确定要退出赛题吗？').wait()
  if (!confirm) return
  if (!taskData.value) return
  if (!currentMember.value) {
    toast.error('无法获取成员信息')
    return
  }
  try {
    await TasksApi.removeParticipant(taskData.value.id, currentMember.value)
    toast.success('退出赛题成功')
    await fetchTaskDetail(taskData.value.id, false)
  } catch (error) {
    toast.error('退出赛题失败')
  }
}

const viewRoles = computed(() => {
  const roles = []
  if (isCreator.value) {
    roles.push({
      value: 'creator',
      title: '创建者',
      type: 'creator',
      isSubmittable: false,
      avatarId: null,
      icon: 'mdi-crown',
    })
  }
  if (isSpaceAdminOrOwner.value) {
    roles.push({
      value: 'space-admin',
      title: '空间管理员',
      type: 'space-admin',
      isSubmittable: false,
      avatarId: null,
      icon: 'mdi-shield-check',
    })
  }
  if (taskData.value?.submitterType === 'USER') {
    if (taskData.value?.approved) {
      roles.push({
        value: 'participant',
        title: '参与者',
        type: 'participant',
        isSubmittable: taskData.value.submittable,
        avatarId: null,
        icon: 'mdi-account',
      })
    }
  } else if (taskData.value?.submitterType === 'TEAM') {
    if (taskData.value?.approved) {
      myTeams.value.forEach((team) => {
        const isSubmittable = taskData.value?.submittableAsTeam?.some(
          (submittableTeam) => submittableTeam.id === team.id
        )
        const isJoinable = taskData.value?.joinableAsTeam?.some((joinableTeam) => joinableTeam.id === team.id)
        if (isSubmittable || isJoinable) {
          roles.push({
            value: team.id.toString(),
            title: team.name,
            type: 'team',
            avatarId: team.avatarId,
            isSubmittable: isSubmittable,
            icon: null,
          })
        }
      })
    }
  }
  return roles
})

watch(viewRoles, (newValue) => {
  if (newValue.length > 0 && !initialLoaded.value) {
    selectedViewRole.value = newValue[0].value
    initialLoaded.value = true
  }
})

const currentViewRole = computed(() => {
  return viewRoles.value.find((role) => role.value === selectedViewRole.value)
})

const currentJoinable = computed(() => {
  if (!taskData.value?.approved) return false
  if (taskData.value?.submitterType === 'USER') {
    return taskData.value.joinable && selectedViewRole.value === 'participant'
  } else {
    return currentViewRole.value?.type === 'team' && !currentViewRole.value.isSubmittable
  }
})

const currentSubmittable = computed(() => {
  if (taskData.value?.submitterType === 'USER') {
    return taskData.value.submittable && selectedViewRole.value === 'participant'
  } else {
    return currentViewRole.value?.type === 'team' && currentViewRole.value.isSubmittable
  }
})

const currentJoined = computed(() => {
  if (taskData.value?.submitterType === 'USER' && currentViewRole.value?.type === 'participant')
    return taskData.value?.joined
  if (
    taskData.value?.submitterType === 'TEAM' &&
    taskData.value?.joinedAsTeam?.length &&
    currentViewRole.value?.type === 'team'
  ) {
    return taskData.value.joinedAsTeam.some((team) => team.id === Number(currentViewRole.value?.value))
  }
  return false
})

const currentManageable = computed(() => {
  return (
    (isCreator.value && selectedViewRole.value === 'creator') ||
    (isSpaceAdminOrOwner.value && selectedViewRole.value === 'space-admin')
  )
})

const currentViewRoleTitle = computed(() => {
  const currentRole = viewRoles.value.find((role) => role.value === selectedViewRole.value)
  return currentRole ? currentRole.title : ''
})

const editDialogOpen = ref(false)
const editTaskData = computed(() => {
  if (!taskData.value) return {}
  return {
    name: taskData.value.name,
    submitterType: taskData.value.submitterType,
    rank: taskData.value.rank,
    defaultDeadline: taskData.value.defaultDeadline,
    deadline: new Date(taskData.value.deadline).getTime(),
    resubmittable: taskData.value.resubmittable,
    editable: taskData.value.editable,
    description: JSON.parse(taskData.value.description),
  }
})

const openEditDialog = () => {
  editDialogOpen.value = true
}

const submitEditTask = async (updatedTaskData: PatchTaskRequestData) => {
  if (!taskData.value) return

  try {
    await TasksApi.update(taskData.value.id, updatedTaskData)
    toast.success(t('tasks.detail.updateSuccess'))
    editDialogOpen.value = false
    await fetchTaskDetail(taskData.value.id, false)
  } catch (error) {
    toast.error(t('tasks.detail.updateFailed'))
    console.error(t('tasks.detail.updateFailed'), error)
  }
}

const deleteTask = async () => {
  if (!taskData.value) return
  if (await dialogs.confirm('确定要删除赛题吗？').wait()) {
    await TasksApi.del(taskData.value.id)
    toast.success('删除成功')
    router.back()
  }
}

const approveParticipant = async (memberId: number) => {
  if (!taskData.value) return
  const deadline = dayjs().add(taskData.value.defaultDeadline, 'day').toDate().getTime()
  try {
    await TasksApi.updateParticipant(taskData.value!.id, memberId, { approved: 'APPROVED', deadline })
    toast.success('通过成功')
  } catch (error) {
    toast.error('通过失败')
  } finally {
    await fetchParticipants()
  }
}

const rejectParticipant = async (memberId: number) => {
  if (!taskData.value) return
  try {
    await TasksApi.updateParticipant(taskData.value!.id, memberId, { approved: 'DISAPPROVED' })
    toast.success('驳回成功')
  } catch (error) {
    toast.error('驳回失败')
  } finally {
    await fetchParticipants()
  }
}

const handleVerifyInfoSubmit = async (formData: TaskParticipantRealNameInfo) => {
  try {
    isVerifyInfoDialogOpen.value = false
    await joinTask(formData)
  } catch (error) {
    toast.error('信息提交失败')
  }
}

const verifyInfoFormRef = ref<InstanceType<typeof VerifyInfoForm> | null>(null)
</script>
<style scoped>
.selected-view-role-icon {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  font-size: 16px;
}
</style>
