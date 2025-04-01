<template>
  <div>
    <v-card flat rounded="lg" class="mb-6">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-icon color="primary" size="28">mdi-account-group</v-icon>
          </div>
        </template>
        <v-card-title class="text-h6 ps-0">参与者管理</v-card-title>
        <template #append>
          <div class="d-flex align-center gap-2">
            <v-btn-group density="comfortable">
              <v-btn
                :color="filterStatus === 'all' ? 'primary' : undefined"
                variant="text"
                @click="filterStatus = 'all'"
              >
                全部
                <v-chip class="ml-2" size="x-small" color="primary" variant="flat">{{ participants.length }}</v-chip>
              </v-btn>
              <v-btn
                :color="filterStatus === 'pending' ? 'primary' : undefined"
                variant="text"
                @click="filterStatus = 'pending'"
              >
                待审核
                <v-chip class="ml-2" size="x-small" color="warning" variant="flat">{{ pendingCount }}</v-chip>
              </v-btn>
              <v-btn
                :color="filterStatus === 'approved' ? 'primary' : undefined"
                variant="text"
                @click="filterStatus = 'approved'"
              >
                已通过
                <v-chip class="ml-2" size="x-small" color="success" variant="flat">{{ approvedCount }}</v-chip>
              </v-btn>
              <v-btn
                :color="filterStatus === 'rejected' ? 'primary' : undefined"
                variant="text"
                @click="filterStatus = 'rejected'"
              >
                已驳回
                <v-chip class="ml-2" size="x-small" color="error" variant="flat">{{ rejectedCount }}</v-chip>
              </v-btn>
            </v-btn-group>
          </div>
        </template>
      </v-card-item>

      <v-divider class="mb-2"></v-divider>

      <v-card-text v-if="loading" class="d-flex justify-center py-6">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-card-text>

      <v-card-text v-else-if="filteredParticipants.length === 0" class="py-12">
        <v-empty-state
          :title="participants.length === 0 ? '暂无参与者' : '没有符合条件的参与者'"
          :text="participants.length === 0 ? '等待用户报名参与赛题' : '尝试调整筛选条件'"
          icon="mdi-account-group"
        ></v-empty-state>
      </v-card-text>

      <template v-else>
        <v-list class="participants-list">
          <v-list-item
            v-for="participant in filteredParticipants"
            :key="participant.id"
            :value="participant.id"
            class="participant-item mb-2 mx-2 rounded-lg"
            :class="{
              'border-pending': participant.approved === 'NONE',
              'border-rejected': participant.approved === 'DISAPPROVED',
            }"
          >
            <template #prepend>
              <v-avatar
                :color="
                  participant.type === 'TEAM'
                    ? 'success'
                    : participant.realNameInfo?.realName
                      ? 'primary'
                      : 'primary-lighten-3'
                "
                size="48"
              >
                <v-img
                  v-if="participant.type === 'USER' && participant.member.avatarId && !taskData?.requireRealName"
                  :src="getAvatarUrl(participant.member.avatarId)"
                  cover
                ></v-img>
                <v-img
                  v-else-if="participant.type === 'TEAM' && participant.team.avatarId"
                  :src="getAvatarUrl(participant.team.avatarId)"
                  cover
                ></v-img>
                <span v-else>{{ getParticipantDisplayName(participant).slice(0, 1) }}</span>
              </v-avatar>
            </template>

            <v-list-item-title>
              <div class="d-flex align-center flex-wrap gap-2">
                <span class="font-weight-medium">{{ getParticipantDisplayName(participant) }}</span>
                <v-chip v-if="participant.type === 'TEAM'" variant="tonal" color="success" size="small" class="my-1">
                  团队
                </v-chip>
                <v-chip
                  v-if="participant.approved === 'NONE'"
                  variant="tonal"
                  color="warning"
                  size="small"
                  class="my-1"
                >
                  待审核
                </v-chip>
                <v-chip
                  v-else-if="participant.approved === 'DISAPPROVED'"
                  variant="tonal"
                  color="error"
                  size="small"
                  class="my-1"
                >
                  已驳回
                </v-chip>
                <v-chip
                  v-else-if="participant.approved === 'APPROVED'"
                  variant="tonal"
                  color="success"
                  size="small"
                  class="my-1"
                >
                  已通过
                </v-chip>
              </div>
            </v-list-item-title>

            <v-list-item-subtitle>
              <template v-if="participant.type === 'USER' && participant.realNameInfo?.realName">
                <div class="d-flex flex-wrap gap-2 mt-1">
                  <span
                    v-if="participant.realNameInfo.grade || participant.realNameInfo.className"
                    class="d-inline-flex align-center"
                  >
                    <v-icon size="16" class="me-1">mdi-school</v-icon>
                    {{ participant.realNameInfo.grade }}级 {{ participant.realNameInfo.className }}
                  </span>
                  <span v-if="participant.realNameInfo.phone" class="d-inline-flex align-center">
                    <v-icon size="16" class="me-1">mdi-phone</v-icon>
                    {{ participant.realNameInfo.phone }}
                  </span>
                  <span v-if="participant.realNameInfo.email" class="d-inline-flex align-center">
                    <v-icon size="16" class="me-1">mdi-email</v-icon>
                    {{ participant.realNameInfo.email }}
                  </span>
                </div>
                <div v-if="participant.realNameInfo.applyReason" class="mt-1">
                  <v-icon size="16" class="me-1">mdi-text-box</v-icon>
                  申请理由：{{ participant.realNameInfo.applyReason }}
                </div>
              </template>
              <template v-if="participant.type === 'TEAM' && participant.teamMembers?.length">
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <span class="d-inline-flex align-center">
                    <v-icon size="16" class="me-1">mdi-account-multiple</v-icon>
                    团队成员：
                  </span>
                  <v-chip
                    v-for="member in participant.teamMembers"
                    :key="member.id"
                    size="x-small"
                    class="ms-1"
                    :color="member.isLeader ? 'primary' : ''"
                    :variant="member.isLeader ? 'flat' : 'outlined'"
                  >
                    {{ taskData?.requireRealName ? member.realName || '未实名用户' : member.name }}
                    <v-icon v-if="member.isLeader" size="12" class="ms-1">mdi-crown</v-icon>
                  </v-chip>
                </div>
              </template>
              <template v-if="participant.deadline">
                <div class="d-flex align-center text-primary mt-1">
                  <v-icon size="16" class="me-1">mdi-clock</v-icon>
                  截止时间：{{ formatDate(participant.deadline) }}
                </div>
              </template>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex flex-column flex-sm-row align-end align-sm-center gap-2">
                <template v-if="participant.approved === 'APPROVED'">
                  <v-btn
                    prepend-icon="mdi-calendar-clock"
                    variant="outlined"
                    color="primary"
                    size="small"
                    @click="showDeadlineDialog(participant)"
                  >
                    设置截止时间
                  </v-btn>
                  <v-btn
                    prepend-icon="mdi-eye"
                    variant="tonal"
                    color="primary"
                    size="small"
                    @click="showSubmissions(participant)"
                  >
                    查看提交
                  </v-btn>
                </template>
                <template v-else-if="participant.approved === 'NONE'">
                  <div class="d-flex gap-2">
                    <v-btn
                      prepend-icon="mdi-check"
                      color="success"
                      variant="tonal"
                      size="small"
                      @click="approveParticipant(participant)"
                    >
                      通过
                    </v-btn>
                    <v-btn
                      prepend-icon="mdi-close"
                      color="error"
                      variant="tonal"
                      size="small"
                      @click="rejectParticipant(participant)"
                    >
                      驳回
                    </v-btn>
                  </div>
                </template>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </template>
    </v-card>

    <!-- 设置截止时间对话框 -->
    <v-dialog v-model="deadlineDialog" max-width="500" class="deadline-dialog">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-4">
          <v-icon left color="primary" class="mr-2">mdi-calendar-clock</v-icon>
          设置提交截止时间
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <p class="mb-4">
            为
            <span class="font-weight-medium">{{
              selectedParticipant ? getParticipantDisplayName(selectedParticipant) : ''
            }}</span>
            设置提交截止时间
          </p>
          <v-form ref="deadlineFormRef">
            <v-date-picker
              v-model="newDeadlineDate"
              class="mb-4"
              elevation="0"
              :min="tomorrow"
              color="primary"
            ></v-date-picker>
            <v-text-field
              v-model="newDeadlineTime"
              label="时间"
              variant="outlined"
              type="time"
              class="mb-2"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="deadlineDialog = false">取消</v-btn>
          <v-btn color="primary" @click="setDeadline">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 提交历史对话框 -->
    <v-dialog v-model="submissionsDialog" fullscreen scrollable>
      <v-card>
        <v-toolbar color="primary" dark class="elevation-0">
          <v-btn icon @click="submissionsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title
            >{{ selectedParticipant ? getParticipantDisplayName(selectedParticipant) : '' }} 的提交记录</v-toolbar-title
          >
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text class="pa-6">
          <TaskSubmissionHistory
            v-if="selectedParticipant && taskData"
            :task-id="taskData.id"
            :participant-id="selectedParticipant.id"
            :reviewable="true"
            :is-dialog="true"
            :outlined="true"
            :highlight-latest="true"
            title="最新提交内容"
            history-title="历史提交记录"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 驳回原因对话框 -->
    <v-dialog v-model="rejectDialog" max-width="500" class="reject-dialog">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-4">
          <v-icon left color="error" class="mr-2">mdi-close-circle</v-icon>
          驳回申请
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <p class="mb-4">
            您正在驳回
            <span class="font-weight-medium">{{
              selectedParticipant ? getParticipantDisplayName(selectedParticipant) : ''
            }}</span>
            的参与申请
          </p>
          <v-textarea
            v-model="rejectReason"
            label="驳回原因（选填）"
            placeholder="请填写驳回原因，帮助申请者了解问题所在"
            variant="outlined"
            rows="3"
            counter="200"
            max-length="200"
            class="mb-2"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="rejectDialog = false">取消</v-btn>
          <v-btn color="error" @click="confirmReject">确认驳回</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskMembership } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import { TasksApi } from '@/network/api/tasks'

const TaskSubmissionHistory = defineAsyncComponent(() => import('@/components/tasks/TaskSubmissionHistory.vue'))

const props = defineProps<{
  taskData: Task | null
}>()

interface TeamMember {
  id: number
  name: string
  realName?: string
  isLeader: boolean
}

interface ParticipantBase {
  id: number
  approved: 'NONE' | 'APPROVED' | 'DISAPPROVED'
  deadline?: string | Date
}

interface TeamParticipant extends ParticipantBase {
  type: 'TEAM'
  team: {
    id: number
    name: string
    avatarId?: number
  }
  teamMembers?: TeamMember[]
}

interface IndividualParticipant extends ParticipantBase {
  type: 'USER'
  member: {
    id: number
    name: string
    avatarId?: number
  }
  realNameInfo?: {
    realName: string
    studentId?: string
    grade?: string
    className?: string
    phone?: string
    email?: string
    applyReason?: string
  }
}

type Participant = TeamParticipant | IndividualParticipant

// 数据状态
const participants = ref<Participant[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)

// 对话框状态
const deadlineDialog = ref(false)
const submissionsDialog = ref(false)
const rejectDialog = ref(false)
const selectedParticipant = ref<Participant | null>(null)
const newDeadlineDate = ref<Date>()
const newDeadlineTime = ref('23:59')
const rejectReason = ref('')

// 计算属性
const tomorrow = computed(() => {
  return dayjs().add(1, 'day').format('YYYY-MM-DD')
})

const pendingCount = computed(() => {
  return participants.value.filter((p) => p.approved === 'NONE').length
})

const approvedCount = computed(() => {
  return participants.value.filter((p) => p.approved === 'APPROVED').length
})

const rejectedCount = computed(() => {
  return participants.value.filter((p) => p.approved === 'DISAPPROVED').length
})

const filteredParticipants = computed(() => {
  let result = participants.value

  // 按状态筛选
  if (filterStatus.value === 'pending') {
    result = result.filter((p) => p.approved === 'NONE')
  } else if (filterStatus.value === 'approved') {
    result = result.filter((p) => p.approved === 'APPROVED')
  } else if (filterStatus.value === 'rejected') {
    result = result.filter((p) => p.approved === 'DISAPPROVED')
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((p) => {
      let name = ''
      let realName = ''
      let studentId = ''

      if (p.type === 'TEAM') {
        name = p.team?.name?.toLowerCase() || ''
        // 团队没有真实姓名和学号
      } else {
        name = p.member?.name?.toLowerCase() || ''
        realName = p.realNameInfo?.realName?.toLowerCase() || ''
        studentId = p.realNameInfo?.studentId?.toLowerCase() || ''
      }

      return name.includes(query) || realName.includes(query) || studentId.includes(query)
    })
  }

  return result
})

// 方法
const formatDate = (date: string | Date | number) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getParticipantDisplayName = (participant: Participant) => {
  // 如果是团队参与
  if (participant.type === 'TEAM') {
    return participant.team?.name || '未命名团队'
  }

  // 如果是实名赛题，且有实名信息则显示实名
  if (props.taskData?.requireRealName && participant.realNameInfo?.realName) {
    return `${participant.realNameInfo.realName}${participant.realNameInfo.studentId ? ` (${participant.realNameInfo.studentId})` : ''}`
  }

  // 否则显示匿名用户名
  return participant.member?.name || '未知用户'
}

const fetchParticipants = async () => {
  if (!props.taskData) return

  loading.value = true
  try {
    const { data } = await TasksApi.getParticipants(props.taskData.id, {
      queryRealNameInfo: true,
      queryTeamInfo: true,
    })

    // 将 API 返回的数据转换为我们定义的类型
    participants.value = data.participants.map((p) => {
      // 根据接口返回的数据结构进行适配
      // 由于 API 返回的数据结构可能与我们定义的不同，需要进行转换
      const submitterType = (p as any).submitterType || 'USER'
      const deadline = p.deadline || undefined

      if (submitterType === 'TEAM') {
        const team = (p as any).team || { id: 0, name: '未命名团队' }
        const teamMembers = (p as any).teamMembers || []

        return {
          id: p.id,
          approved: p.approved,
          deadline,
          type: 'TEAM' as const,
          team: {
            id: team.id || 0,
            name: team.name || '未命名团队',
            avatarId: team.avatarId,
          },
          teamMembers: teamMembers.map((m: any) => ({
            id: m.id,
            name: m.name,
            realName: m.realName,
            isLeader: m.isLeader,
          })),
        }
      } else {
        return {
          id: p.id,
          approved: p.approved,
          deadline,
          type: 'USER' as const,
          member: {
            id: p.member.id,
            name: p.member.name,
            avatarId: p.member.avatarId,
          },
          realNameInfo: p.realNameInfo,
        }
      }
    }) as Participant[]
  } catch (error) {
    toast.error('获取参与者列表失败')
  } finally {
    loading.value = false
  }
}

const showDeadlineDialog = (participant: Participant) => {
  selectedParticipant.value = participant
  const defaultDate = participant.deadline ? dayjs(participant.deadline).toDate() : new Date(tomorrow.value)
  const defaultTime = participant.deadline ? dayjs(participant.deadline).format('HH:mm') : '23:59'

  newDeadlineDate.value = defaultDate
  newDeadlineTime.value = defaultTime
  deadlineDialog.value = true
}

const setDeadline = async () => {
  if (!selectedParticipant.value || !props.taskData) return

  // 组合日期和时间
  const deadline = dayjs(`${newDeadlineDate.value} ${newDeadlineTime.value}`).valueOf()

  try {
    await TasksApi.updateParticipant(props.taskData.id, selectedParticipant.value.id, { deadline })
    toast.success('截止时间设置成功')
    deadlineDialog.value = false
    await fetchParticipants()
  } catch (error) {
    toast.error('设置截止时间失败')
  }
}

const showSubmissions = (participant: Participant) => {
  selectedParticipant.value = participant
  submissionsDialog.value = true
}

const approveParticipant = async (participant: Participant) => {
  if (!props.taskData) return

  // 设置默认截止时间（当前时间 + 默认天数）
  const defaultDeadlineDays = props.taskData.defaultDeadline || 7
  const deadline = dayjs().add(defaultDeadlineDays, 'day').valueOf()

  try {
    await TasksApi.updateParticipant(props.taskData.id, participant.id, { approved: 'APPROVED', deadline })
    toast.success('已通过申请')
    await fetchParticipants()
  } catch (error) {
    toast.error('操作失败')
  }
}

const rejectParticipant = (participant: Participant) => {
  selectedParticipant.value = participant
  rejectReason.value = ''
  rejectDialog.value = true
}

const confirmReject = async () => {
  if (!selectedParticipant.value || !props.taskData) return

  try {
    await TasksApi.updateParticipant(props.taskData.id, selectedParticipant.value.id, {
      approved: 'DISAPPROVED',
      // rejectReason: rejectReason.value || undefined,
    })
    toast.success('已驳回申请')
    rejectDialog.value = false
    await fetchParticipants()
  } catch (error) {
    toast.error('操作失败')
  }
}

// 监听器
watch(
  () => props.taskData,
  (newVal) => {
    if (newVal) {
      fetchParticipants()
    }
  },
  { immediate: true }
)

watch([filterStatus, searchQuery], () => {
  currentPage.value = 1
})

// 生命周期
onMounted(() => {
  if (props.taskData) {
    fetchParticipants()
  }
})
</script>

<style scoped>
.participants-list {
  background-color: transparent;
}

.participant-item {
  background-color: var(--v-theme-surface);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.participant-item:hover {
  background-color: var(--v-theme-surface-light);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.border-pending {
  border-color: rgba(var(--v-theme-warning), 0.3);
}

.border-rejected {
  border-color: rgba(var(--v-theme-error), 0.3);
}

.max-width-200 {
  max-width: 200px;
}

@media (max-width: 600px) {
  .max-width-200 {
    max-width: 100%;
  }
}
</style>
