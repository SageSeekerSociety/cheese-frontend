<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- 视角选择菜单 -->
        <v-menu v-if="viewRoles.length > 1">
          <template #activator="{ props }">
            <div class="d-flex flex-row align-center mb-4 text-medium-emphasis">
              <v-icon left size="24" class="mr-1">mdi-eye</v-icon>
              正在以
              <v-btn v-bind="props" variant="text" color="text" density="comfortable">
                {{ currentViewRoleTitle }}
                <v-icon right size="24">mdi-chevron-down</v-icon>
              </v-btn>
              视角查看
            </div>
          </template>
          <v-list color="primary">
            <!-- 个人视角 -->
            <v-list-item
              v-for="role in viewRoles.filter((role) => role.type === 'participant' || role.type === 'creator')"
              :key="role.value"
              :value="role.value"
              :active="selectedViewRole === role.value"
              @click="selectedViewRole = role.value"
            >
              <template #prepend>
                <v-avatar size="32">
                  <v-img :src="getAvatarUrl(AccountService.user?.avatarId)" />
                </v-avatar>
              </template>
              <v-list-item-title>{{ role.title }}</v-list-item-title>
              <template #append>
                <v-icon>{{ role.type === 'creator' ? 'mdi-crown' : 'mdi-account' }}</v-icon>
                <v-icon v-if="selectedViewRole === role.value" color="primary" class="ml-2">mdi-check</v-icon>
              </template>
            </v-list-item>

            <!-- 可参与的小队视角 -->
            <v-list-subheader v-if="viewRoles.some((role) => role.type === 'team' && !role.isSubmittable)"
              >可参与的小队</v-list-subheader
            >
            <v-list-item
              v-for="role in viewRoles.filter((role) => role.type === 'team' && !role.isSubmittable)"
              :key="role.value"
              :value="role.value"
              :active="selectedViewRole === role.value"
              @click="selectedViewRole = role.value"
            >
              <template #prepend>
                <v-avatar size="32">
                  <v-img v-if="role.avatarId" :src="getAvatarUrl(role.avatarId)" />
                  <v-icon v-else>{{ role.icon }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ role.title }}</v-list-item-title>
              <template #append>
                <v-icon>mdi-lock-open</v-icon>
                <v-icon v-if="selectedViewRole === role.value" color="primary" class="ml-2">mdi-check</v-icon>
              </template>
            </v-list-item>

            <!-- 可提交的小队视角 -->
            <v-list-subheader v-if="viewRoles.some((role) => role.type === 'team' && role.isSubmittable)"
              >可提交的小队</v-list-subheader
            >
            <v-list-item
              v-for="role in viewRoles.filter((role) => role.type === 'team' && role.isSubmittable)"
              :key="role.value"
              :value="role.value"
              :active="selectedViewRole === role.value"
              @click="selectedViewRole = role.value"
            >
              <template #prepend>
                <v-avatar size="32">
                  <v-img v-if="role.avatarId" :src="getAvatarUrl(role.avatarId)" />
                  <v-icon v-else>{{ role.icon }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ role.title }}</v-list-item-title>
              <template #append>
                <v-icon>mdi-upload</v-icon>
                <v-icon v-if="selectedViewRole === role.value" color="primary" class="ml-2">mdi-check</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-sheet v-if="taskData" flat rounded="lg" class="pa-4">
          <div class="d-flex flex-row align-center justify-space-between">
            <div>
              <div class="text-h6">
                <v-icon left size="24" class="text-primary mr-1">mdi-trophy</v-icon>
                {{ taskData?.name }}
              </div>
              <div class="text-subtitle-1 text-medium-emphasis">
                {{ taskData?.creator.nickname }} 发布于 {{ dayjs(taskData?.createdAt).format('YYYY-MM-DD HH:mm') }}
              </div>
              <div class="d-flex flex-row align-center" style="gap: 4px">
                <v-chip color="primary" variant="tonal">{{
                  taskData?.submitterType === 'USER' ? '个人任务' : '小队任务'
                }}</v-chip>
                <v-chip v-if="taskData?.resubmittable" variant="tonal">可重复提交</v-chip>
              </div>
            </div>
            <template v-if="currentJoinable">
              <v-btn color="primary" variant="flat" @click="joinTask">领取赛题</v-btn>
            </template>
            <template v-else-if="!isCreator">
              <div v-if="countdown || isExpired" class="text-center">
                <div v-if="countdown && !isExpired" class="countdown-display">
                  <span class="countdown-number text-primary">{{ countdown.days }}</span> 天
                  <span class="countdown-number text-primary">{{ countdown.hours }}</span> 时
                  <span class="countdown-number text-primary">{{ countdown.minutes }}</span> 分
                  <span class="countdown-number text-primary">{{ countdown.seconds }}</span> 秒
                </div>
                <div v-else class="expired-text text-error">已截止</div>
                <div v-if="countdown" class="text-caption">剩余时间</div>
              </div>
            </template>
            <template v-if="isCreator">
              <v-btn color="primary" variant="outlined" @click="openEditDialog"> 编辑赛题 </v-btn>
            </template>
          </div>
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
      <v-row>
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

    <template v-if="currentManageable">
      <v-row>
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
                    <v-avatar color="primary" size="36">
                      {{ participant.name.charAt(0) }}
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ participant.name }}</v-list-item-title>
                  <template #append>
                    <v-btn variant="text" @click="showParticipantSubmissions(participant.id)"> 查看提交 </v-btn>
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

  <v-dialog v-model="participantSubmissionsDialog" fullscreen scrollable>
    <v-card color="surface-light">
      <v-toolbar color="surface">
        <v-btn icon="mdi-close" @click="participantSubmissionsDialog = false"></v-btn>

        <v-toolbar-title>{{ selectedParticipant?.name }} 的提交记录</v-toolbar-title>

        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <TaskSubmissionHistory
            v-if="selectedParticipant"
            :task-id="Number(route.params.taskId)"
            :member-id="selectedParticipant?.id"
            :show-title="false"
            :reviewable="currentManageable"
          />
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- 添加编辑对话框 -->
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
            @submit="submitEditTask"
          />
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { PatchTaskRequestData } from '@/network/api/tasks/types'
import type { Task, TaskParticipantSummary, Team } from '@/types'

import { computed, onMounted, onWatcherCleanup, reactive, ref, useTemplateRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { toast } from 'vuetify-sonner'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'
import { setTitle } from '@/utils/title'

import CollapsibleContent from '@/components/common/CollapsibleContent.vue'
import TipTapViewer from '@/components/common/Editor/TipTapViewer.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import TaskSubmissionHistory from '@/components/tasks/TaskSubmissionHistory.vue'
import { AttachmentsApi } from '@/network/api/attachments'
import { TasksApi } from '@/network/api/tasks'
import { TeamsApi } from '@/network/api/teams'
import AccountService from '@/services/account'

const route = useRoute()
const myTeams = ref<Team[]>([])
const taskData = ref<Task | null>(null)
const submissionContent = ref<{ contentText?: string; contentAttachment?: File }[]>([])
const countdown = ref<{ days: string; hours: string; minutes: string; seconds: string } | null>(null)
const isExpired = ref(false)
const progressDialog = ref(false)
const uploadProgress = ref(0)
const submissionHistoryRef = useTemplateRef<typeof TaskSubmissionHistory>('submissionHistoryRef')

const { t } = useI18n()
const fetchTaskDetail = async (taskId: number, clearSubmissionContent = true) => {
  const {
    data: { task },
  } = await TasksApi.detail(taskId)
  taskData.value = task
  if (clearSubmissionContent) {
    submissionContent.value = reactive(task.submissionSchema.map(() => ({})))
  }
  if (task) {
    editTaskData.value.name = task.name
    editTaskData.value.submitterType = task.submitterType
    editTaskData.value.rank = task.rank
    editTaskData.value.deadline = dayjs(task.deadline).format('YYYY-MM-DDTHH:mm')
    editTaskData.value.resubmittable = task.resubmittable
    editTaskData.value.editable = task.editable
    editTaskData.value.description = JSON.parse(task.description)
  }
}

const currentMember = computed(() => {
  if (selectedViewRole.value === 'creator' || selectedViewRole.value === 'participant') {
    return AccountService.user?.id
  } else {
    return Number(selectedViewRole.value)
  }
})

const isCreator = computed(() => AccountService.user?.id === taskData.value?.creator.id)
const participants = ref<TaskParticipantSummary[]>([])
const participantSubmissionsDialog = ref(false)
const selectedParticipant = ref<TaskParticipantSummary | null>(null)

const taskDescription = computed(() => {
  try {
    return JSON.parse(taskData.value?.description ?? '{}')
  } catch (error) {
    return taskData.value?.description
  }
})

const fetchParticipants = async () => {
  if (!taskData.value) return
  const { data } = await TasksApi.getParticipants(taskData.value.id)
  participants.value = data.participants
}

const showParticipantSubmissions = async (participantId: number) => {
  selectedParticipant.value = participants.value.find((p) => p.id === participantId) || null
  if (selectedParticipant.value && taskData.value) {
    participantSubmissionsDialog.value = true
  }
}

const fetchMyTeams = async () => {
  const { data } = await TeamsApi.getMyTeams()
  myTeams.value = data.teams
}

onMounted(async () => {
  await fetchMyTeams()
  await fetchTaskDetail(Number(route.params.taskId))
  setTitle(taskData.value?.name || '赛题', route)
  if (taskData.value?.deadline) {
    startCountdown()
  }
  if (isCreator.value) {
    await fetchParticipants()
    selectedViewRole.value = taskData.value?.submitterType === 'USER' ? 'participant' : 'creator'
  } else {
    if (taskData.value?.submitterType === 'TEAM') {
      const submittableTeam = taskData.value.submittableAsTeam?.find((team) =>
        myTeams.value.some((myTeam) => myTeam.id === team.id)
      )
      if (submittableTeam) {
        selectedViewRole.value = submittableTeam.id.toString()
      } else {
        const joinableTeam = taskData.value.joinableAsTeam?.find((team) =>
          myTeams.value.some((myTeam) => myTeam.id === team.id)
        )
        if (joinableTeam) {
          selectedViewRole.value = joinableTeam.id.toString()
        }
      }
    } else {
      selectedViewRole.value = 'participant'
    }
  }
})

const startCountdown = () => {
  watchEffect(() => {
    const updateCountdown = () => {
      const now = dayjs()
      const deadline = dayjs(taskData.value?.deadline)
      const diff = deadline.diff(now)

      if (diff > 0) {
        const durationObj = dayjs.duration(diff)
        countdown.value = {
          days: durationObj.days().toString().padStart(2, '0'),
          hours: durationObj.hours().toString().padStart(2, '0'),
          minutes: durationObj.minutes().toString().padStart(2, '0'),
          seconds: durationObj.seconds().toString().padStart(2, '0'),
        }
        isExpired.value = false
      } else {
        countdown.value = null
        isExpired.value = true
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    onWatcherCleanup(() => clearInterval(timer))
  })
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

const joinTask = async () => {
  if (!currentMember.value) {
    toast.error('无法获取成员信息')
    return
  }
  try {
    await TasksApi.addParticipant(taskData.value!.id, currentMember.value)
    toast.success('领取赛题成功')
    await fetchTaskDetail(taskData.value!.id, false)
    if (isCreator.value) {
      await fetchParticipants()
    }
    // 更新视角选择
    const updatedRole = viewRoles.value.find((role) => role.value === selectedViewRole.value)
    if (updatedRole) {
      updatedRole.isSubmittable = true
    }
  } catch (error) {
    toast.error('领取赛题失败')
  }
}

// 添加新的响应式变量
const selectedViewRole = ref<'participant' | 'creator' | string>('participant')

// 计算可用的浏览身份
const viewRoles = computed(() => {
  const roles = []
  if (taskData.value?.submitterType === 'USER') {
    roles.push({
      value: 'participant',
      title: '参与者',
      type: 'participant',
      isSubmittable: taskData.value.submittable,
      avatarId: null,
      icon: 'mdi-account',
    })
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
  } else if (taskData.value?.submitterType === 'TEAM') {
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
    myTeams.value.forEach((team) => {
      const isSubmittable = taskData.value?.submittableAsTeam?.some((submittableTeam) => submittableTeam.id === team.id)
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
  return roles
})

// 新增的计算属性
const currentJoinable = computed(() => {
  if (taskData.value?.submitterType === 'USER') {
    return taskData.value.joinable && selectedViewRole.value === 'participant'
  } else {
    const currentRole = viewRoles.value.find((role) => role.value === selectedViewRole.value)
    return currentRole?.type === 'team' && !currentRole.isSubmittable
  }
})

const currentSubmittable = computed(() => {
  if (taskData.value?.submitterType === 'USER') {
    return taskData.value.submittable && selectedViewRole.value === 'participant'
  } else {
    const currentRole = viewRoles.value.find((role) => role.value === selectedViewRole.value)
    return currentRole?.type === 'team' && currentRole.isSubmittable
  }
})

const currentManageable = computed(() => {
  return isCreator.value && selectedViewRole.value === 'creator'
})

const currentViewRoleTitle = computed(() => {
  const currentRole = viewRoles.value.find((role) => role.value === selectedViewRole.value)
  return currentRole ? currentRole.title : ''
})

// 添加新的响应式变量
const editDialogOpen = ref(false)
const editTaskData = computed(() => {
  if (!taskData.value) return {}
  return {
    name: taskData.value.name,
    submitterType: taskData.value.submitterType,
    rank: taskData.value.rank,
    deadline: dayjs(taskData.value.deadline).format('YYYY-MM-DDTHH:mm'),
    resubmittable: taskData.value.resubmittable,
    editable: taskData.value.editable,
    description: JSON.parse(taskData.value.description),
  }
})

// 添加打开编辑对话框的方法
const openEditDialog = () => {
  if (taskData.value) {
    editTaskData.value.name = taskData.value.name
    editTaskData.value.submitterType = taskData.value.submitterType
    editTaskData.value.rank = taskData.value.rank
    editTaskData.value.deadline = dayjs(taskData.value.deadline).format('YYYY-MM-DDTHH:mm')
    editTaskData.value.resubmittable = taskData.value.resubmittable
    editTaskData.value.editable = taskData.value.editable
    editTaskData.value.description = JSON.parse(taskData.value.description)
  }
  editDialogOpen.value = true
}

// 添加提交编辑的方法
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
</script>

<style scoped>
.countdown-display {
  font-size: 1.2rem;
}
.countdown-number {
  font-weight: bold;
  font-size: 1.4rem;
}
.expired-text {
  font-weight: bold;
  font-size: 1.2rem;
}
.file-card {
  gap: 4px;
  padding: 8px;
}
</style>
