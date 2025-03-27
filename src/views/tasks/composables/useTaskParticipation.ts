import type { TaskParticipantRealNameInfo } from '@/types'
import type { useTaskData } from './useTaskData'

import { ref } from 'vue'
import { toast } from 'vuetify-sonner'

import { useEvents } from '../events'

import { TasksApi } from '@/network/api/tasks'
import { useDialog } from '@/plugins/dialog'
import AccountService from '@/services/account'

export function useTaskParticipation(taskDataModule: ReturnType<typeof useTaskData>) {
  const { taskData, loadTaskData } = taskDataModule
  const dialogs = useDialog()
  const events = useEvents()

  const selectedTeamId = ref<number | null>(null)

  // 注册事件监听
  events.on('select-team', (teamId: number) => {
    selectedTeamId.value = teamId
    events.emit('verify-dialog-open', true)
  })

  // 处理参与任务逻辑
  const onJoinTaskClicked = () => {
    if (taskData.value?.submitterType === 'TEAM') {
      events.emit('team-selection-dialog-open', true)
    } else {
      events.emit('verify-dialog-open', true)
    }
  }

  // 处理验证信息提交
  const handleVerifyInfoSubmit = async (
    formData: Pick<TaskParticipantRealNameInfo, 'phone' | 'email' | 'applyReason'>
  ) => {
    try {
      events.emit('verify-dialog-open', false)

      if (taskData.value?.submitterType === 'TEAM' && selectedTeamId.value) {
        await joinTaskWithTeam(formData, selectedTeamId.value)
      } else {
        await joinTaskAsIndividual(formData)
      }
    } catch (error) {
      toast.error('信息提交失败')
    }
  }

  // 团队参与任务
  const joinTaskWithTeam = async (
    contactInfo: Pick<TaskParticipantRealNameInfo, 'phone' | 'email' | 'applyReason'>,
    teamId: number
  ) => {
    if (!taskData.value || !teamId) return

    try {
      await TasksApi.addParticipant(taskData.value.id, teamId, {
        deadline: null,
        email: contactInfo.email,
        phone: contactInfo.phone,
        applyReason: contactInfo.applyReason,
        personalAdvantage: undefined,
        remark: undefined,
      })

      toast.success('小队领取赛题成功')
      await loadTaskData()
      events.emit('reload-joined-teams')
    } catch (error) {
      toast.error('小队领取赛题失败')
      console.error('Failed to join task as team:', error)
    }
  }

  // 个人参与任务
  const joinTaskAsIndividual = async (
    contactInfo?: Pick<TaskParticipantRealNameInfo, 'phone' | 'email' | 'applyReason'>
  ) => {
    if (!taskData.value) return
    try {
      const userId = AccountService.user?.id
      if (!userId) {
        toast.error('请先登录')
        return
      }

      await TasksApi.addParticipant(taskData.value.id, userId, {
        deadline: null,
        email: contactInfo?.email,
        phone: contactInfo?.phone,
        applyReason: contactInfo?.applyReason,
        personalAdvantage: undefined,
        remark: undefined,
      })

      toast.success('领取赛题成功')
      await loadTaskData()
    } catch (error) {
      toast.error('领取赛题失败')
    }
  }

  // 退出任务主逻辑
  const confirmLeaveTask = async () => {
    if (!taskData.value) return

    if (taskData.value.submitterType === 'TEAM') {
      const joinedTeams = taskData.value.joinedTeams || []

      if (joinedTeams.length > 1) {
        events.emit('leave-team-dialog-open', true)
      } else if (joinedTeams.length === 1) {
        const teamId = joinedTeams[0].id
        const confirmed = await dialogs
          .confirm(`确定要让小队"${joinedTeams[0].name}"退出该赛题吗？`, {
            title: '确认退出',
          })
          .wait()

        if (confirmed) {
          await leaveTaskWithTeam(teamId)
        }
      } else {
        toast.info('您没有代表小队参与此赛题')
      }
    } else {
      const confirmed = await dialogs
        .confirm('确定要退出该赛题吗？', {
          title: '确认退出',
        })
        .wait()

      if (confirmed) {
        await leaveTaskAsIndividual()
      }
    }
  }

  // 个人退出任务
  const leaveTaskAsIndividual = async () => {
    if (!taskData.value) return

    const userId = AccountService.user?.id
    if (!userId) return

    try {
      await TasksApi.removeParticipantByMemberId(taskData.value.id, userId)
      toast.success('退出赛题成功')
      await loadTaskData()
    } catch (error) {
      toast.error('退出赛题失败')
    }
  }

  // 团队退出任务
  const leaveTaskWithTeam = async (teamId: number) => {
    if (!taskData.value || !teamId) return

    try {
      await TasksApi.removeParticipantByMemberId(taskData.value.id, teamId)
      toast.success('小队已退出赛题')
      await loadTaskData()
    } catch (error) {
      toast.error('退出赛题失败')
      console.error('Failed to leave task:', error)
    }
  }

  return {
    onJoinTaskClicked,
    handleVerifyInfoSubmit,
    confirmLeaveTask,
    leaveTaskWithTeam,
  }
}
