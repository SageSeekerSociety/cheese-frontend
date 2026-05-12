import type { Task } from '@/types'

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { truncateString } from '@/utils/form'
import { getTaskStatusText, getTaskStatusType } from '@/utils/tasks'

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

  /** 判断是否为 TipTap JSON 格式 */
  const isTipTapJson = (raw: string): boolean => {
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === 'object' && parsed !== null && parsed.type === 'doc'
    } catch {
      return false
    }
  }

  /** 解析描述内容，支持 TipTap JSON 和 Markdown 格式 */
  const parseDescription = (raw: string): any => {
    if (!raw) return { type: 'doc', content: [] }
    if (isTipTapJson(raw)) {
      try {
        return JSON.parse(raw)
      } catch {
        return { type: 'doc', content: [] }
      }
    }
    // 如果是 markdown 格式，返回包含 markdown 内容的文档结构
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: raw,
            },
          ],
        },
      ],
    }
  }

  /** 判断描述内容的原始格式 */
  const getDescriptionFormat = (raw: string): 'markdown' | 'tiptap' => {
    if (isTipTapJson(raw)) {
      return 'tiptap'
    }
    return 'markdown'
  }

  const editTaskData = computed(() => {
    if (!taskData.value) return {}
    return {
      name: taskData.value.name,
      submitterType: taskData.value.submitterType,
      rank: taskData.value.rank,
      defaultDeadline: taskData.value.defaultDeadline,
      registrationStartAt: taskData.value.registrationStartAt
        ? new Date(taskData.value.registrationStartAt).getTime()
        : null,
      deadline: new Date(taskData.value.deadline).getTime(),
      resubmittable: taskData.value.resubmittable,
      editable: taskData.value.editable,
      description: parseDescription(taskData.value.description),
      descriptionFormat: getDescriptionFormat(taskData.value.description),
      originalDescription: taskData.value.description,
      requireRealName: taskData.value.requireRealName,
      minTeamSize: taskData.value.minTeamSize,
      maxTeamSize: taskData.value.maxTeamSize,
      participantLimit: taskData.value.participantLimit,
      teamLockingPolicy: taskData.value.teamLockingPolicy,
      categoryId: taskData.value.category?.id,
      videoUrl: taskData.value.videoUrl || '',
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
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载赛题信息失败'
      console.error('Failed to load task:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    taskId,
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
