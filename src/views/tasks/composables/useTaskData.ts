import type { Task } from '@/types'

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { truncateString } from '@/utils/form'
import { getTaskStatusText, getTaskStatusType } from '@/utils/tasks'
import { setTitle } from '@/utils/title'

import { TasksApi } from '@/network/api/tasks'
import { TaskParticipationInfo } from '@/network/api/tasks/types'
import AccountService from '@/services/account'

export function useTaskData() {
  const route = useRoute()
  const taskId = computed(() => Number(route.params.taskId))

  const taskData = ref<Task | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const participationInfo = ref<TaskParticipationInfo>({
    hasParticipation: false,
    identities: [],
  })

  // 计算属性
  const isTaskCreator = computed(() => AccountService.user?.id === taskData.value?.creator.id)
  const isSpaceAdmin = computed(() => {
    if (!taskData.value?.space) return false
    return taskData.value.space.admins.some((admin) => admin.user.id === AccountService.user?.id)
  })

  const taskStatusText = computed(() => getTaskStatusText(taskData.value))
  const taskStatusType = computed(() => getTaskStatusType(taskData.value))

  const titleStartsWithChinesePunctuation = computed(() => {
    const chinesePunctuations = ['【', '《', '「', '『', '（', '〈', '〖', '［', '｛', '〔']
    return chinesePunctuations.some((p) => taskData.value?.name.startsWith(p))
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
      requireRealName: taskData.value.requireRealName,
      minTeamSize: taskData.value.minTeamSize,
      maxTeamSize: taskData.value.maxTeamSize,
      participantLimit: taskData.value.participantLimit,
      teamLockingPolicy: taskData.value.teamLockingPolicy,
      categoryId: taskData.value.category?.id,
    }
  })

  // 加载任务数据
  const loadTaskData = async () => {
    loading.value = true
    error.value = null

    try {
      const { data } = await TasksApi.detail(taskId.value)
      taskData.value = data.task

      // 获取参与身份信息
      if (data.participation) {
        participationInfo.value = data.participation
      } else {
        participationInfo.value = {
          hasParticipation: false,
          identities: [],
        }
      }

      // 设置页面标题
      setTitle(taskData.value.name || '赛题详情', route)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载赛题信息失败'
      console.error('Failed to load task:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    taskData,
    loading,
    error,
    isTaskCreator,
    isSpaceAdmin,
    taskStatusText,
    taskStatusType,
    titleStartsWithChinesePunctuation,
    breadcrumbItems,
    editTaskData,
    loadTaskData,
    participationInfo,
  }
}
