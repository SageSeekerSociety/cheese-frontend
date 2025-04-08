import type { Team, TeamSummary, TeamTaskEligibility } from '@/types'
import type { useTaskData } from './useTaskData'

import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'

import { useEvents } from '../events'

import { useDialog } from '@/plugins/dialog'

export function useTeamParticipation(taskDataModule: ReturnType<typeof useTaskData>) {
  const { taskData } = taskDataModule
  const dialogs = useDialog()
  const events = useEvents()

  // UI状态
  const teamSelectionDialogOpen = ref(false)
  const leaveTeamDialogOpen = ref(false)
  const loadingTeams = ref(false)

  // 数据状态
  const availableTeams = ref<TeamTaskEligibility[]>([])
  const joinedTeams = ref<Team[]>([])
  const selectedTeamId = ref<number | null>(null)
  const selectedLeaveTeamId = ref<number | null>(null)

  // 监听事件
  onMounted(() => {
    events.on('team-selection-dialog-open', (value: boolean) => {
      if (value) {
        openTeamSelectionDialog()
      } else {
        teamSelectionDialogOpen.value = false
      }
    })

    events.on('leave-team-dialog-open', (value: boolean) => {
      leaveTeamDialogOpen.value = value
    })

    events.on('reload-joined-teams', () => {
      loadJoinedTeams()
    })
  })

  // 当任务数据更新时，更新团队信息
  watch(
    () => taskData.value,
    () => {
      if (taskData.value) {
        updateTeamsFromTaskData()
      }
    },
    { immediate: true }
  )

  // 从任务数据中更新团队信息
  const updateTeamsFromTaskData = () => {
    if (!taskData.value) return

    // 如果有participationEligibility数据，使用它来更新可用团队
    if (taskData.value.participationEligibility?.teams) {
      availableTeams.value = taskData.value.participationEligibility.teams
    } else {
      availableTeams.value = []
    }

    // 更新已加入的团队
    if (taskData.value.joinedTeams && Array.isArray(taskData.value.joinedTeams)) {
      joinedTeams.value = [...taskData.value.joinedTeams]
    } else {
      joinedTeams.value = []
    }
  }

  // 获取团队验证状态
  const getTeamVerificationStatus = (team: TeamSummary): { status: string; color: string } => {
    if (!taskData.value?.requireRealName) {
      return { status: '可参与', color: 'success' }
    }

    if (team.allMembersVerified) {
      return { status: '全部已认证', color: 'success' }
    } else {
      return { status: '未全部认证', color: 'error' }
    }
  }

  // 获取可选择的团队列表（符合条件的团队）
  const eligibleTeams = computed(() => {
    return availableTeams.value.filter((team) => team.eligibility.eligible)
  })

  // 打开团队选择对话框
  const openTeamSelectionDialog = async () => {
    if (!taskData.value) return

    loadingTeams.value = true
    selectedTeamId.value = null

    try {
      // 直接使用任务数据中的团队信息
      updateTeamsFromTaskData()

      if (eligibleTeams.value.length === 0) {
        toast.info('您没有符合条件的小队可以参与此赛题')
      }

      teamSelectionDialogOpen.value = true
    } catch (error) {
      toast.error('获取小队信息失败')
      console.error('Failed to process teams:', error)
    } finally {
      loadingTeams.value = false
    }
  }

  // 选择团队
  const selectTeam = (teamId: number) => {
    selectedTeamId.value = teamId
    teamSelectionDialogOpen.value = false
    events.emit('team-selection-dialog-open', false)
  }

  // 加载已参与的团队
  const loadJoinedTeams = async () => {
    if (!taskData.value) return

    // 已参与的团队信息应该直接从任务数据中获取
    if (taskData.value.joinedTeams && Array.isArray(taskData.value.joinedTeams)) {
      joinedTeams.value = [...taskData.value.joinedTeams]
    } else {
      joinedTeams.value = []
    }
  }

  // 选择要退出的团队
  const selectLeaveTeam = (teamId: number) => {
    selectedLeaveTeamId.value = teamId
  }

  // 确认退出选定的团队
  const confirmLeaveSelectedTeam = async () => {
    if (!selectedLeaveTeamId.value) return

    const teamName = joinedTeams.value.find((team) => team.id === selectedLeaveTeamId.value)?.name

    const confirmed = await dialogs
      .confirm(`确定要让小队"${teamName}"退出该赛题吗？`, {
        title: '确认退出',
      })
      .wait()

    if (confirmed) {
      leaveTeamDialogOpen.value = false
      // 通过事件总线通知退出赛题
      events.emit('leave-team', selectedLeaveTeamId.value)
    }
  }

  return {
    // UI状态
    teamSelectionDialogOpen,
    loadingTeams,
    leaveTeamDialogOpen,

    // 数据
    availableTeams,
    eligibleTeams,
    selectedTeamId,
    selectedLeaveTeamId,
    joinedTeams,

    // 状态查询
    getTeamVerificationStatus,

    // 操作方法
    openTeamSelectionDialog,
    selectTeam,
    loadJoinedTeams,
    selectLeaveTeam,
    confirmLeaveSelectedTeam,
  }
}
