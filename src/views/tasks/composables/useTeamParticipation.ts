import type { TeamSummary } from '@/network/api/tasks/types'
import type { useTaskData } from './useTaskData'

import { onMounted, ref } from 'vue'
import { toast } from 'vuetify-sonner'

import { useEvents } from '../events'

import { TasksApi } from '@/network/api/tasks'
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
  const availableTeams = ref<TeamSummary[]>([])
  const joinedTeams = ref<TeamSummary[]>([])
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

  // 加载可用团队
  const openTeamSelectionDialog = async () => {
    if (!taskData.value) return

    loadingTeams.value = true
    selectedTeamId.value = null

    try {
      const { data } = await TasksApi.getTaskTeams(taskData.value.id)
      availableTeams.value = data.teams

      if (availableTeams.value.length === 0) {
        toast.info('您没有符合条件的小队可以参与此赛题')
      }

      teamSelectionDialogOpen.value = true
    } catch (error) {
      toast.error('获取小队信息失败')
      console.error('Failed to load teams:', error)
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

    loadingTeams.value = true
    try {
      const { data } = await TasksApi.getTaskTeams(taskData.value.id, { filter: 'all' })

      joinedTeams.value = data.teams.filter((team) =>
        taskData.value?.joinedTeams?.some((joinedTeam) => joinedTeam.id === team.id)
      )
    } catch (error) {
      console.error('Failed to load joined teams:', error)
      toast.error('加载参与小队失败')
    } finally {
      loadingTeams.value = false
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
