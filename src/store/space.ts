import type { Space, SpaceAnnouncement, SpaceTaskTemplate, Topic } from '@/types'

import { computed, ref } from 'vue'
import { toast } from 'vuetify-sonner'
import { defineStore } from 'pinia'

import { SpacesApi } from '@/network/api/spaces'
import { PatchSpaceRequestData } from '@/network/api/spaces/types'

export const useSpaceStore = defineStore('space', () => {
  const currentSpace = ref<Space | null>(null)
  const currentSpaceId = ref<number | null>(null)
  const templates = computed<SpaceTaskTemplate[]>(() => {
    if (!currentSpace.value) return []
    try {
      return JSON.parse(currentSpace.value.taskTemplates || '[]')
    } catch (error) {
      console.error('解析模板失败:', error)
      return []
    }
  })

  const announcements = computed<SpaceAnnouncement[]>(() => {
    if (!currentSpace.value) return []
    try {
      return JSON.parse(currentSpace.value.announcements || '[]')
    } catch (error) {
      console.error('解析公告失败:', error)
      return []
    }
  })

  const classificationTopics = computed<Topic[]>(() => {
    if (!currentSpace.value) return []
    return currentSpace.value.classificationTopics || []
  })

  const fetchSpace = async (spaceId: number) => {
    const isAnotherSpace = spaceId !== currentSpaceId.value
    if (isAnotherSpace) {
      currentSpace.value = null
    }
    currentSpaceId.value = spaceId

    try {
      const { data } = await SpacesApi.detail(spaceId, { queryClassificationTopics: true, queryMyRank: true })
      currentSpace.value = data.space
    } catch (error) {
      console.error('获取空间信息失败:', error)
      toast.error('获取空间信息失败')
    }
  }

  const updateSpace = async (spaceId: number, data: PatchSpaceRequestData, shouldToast: boolean = true) => {
    try {
      const response = await SpacesApi.update(spaceId, data)
      currentSpace.value = response.data.space
      if (shouldToast) toast.success('更新成功')
    } catch (error) {
      console.error('更新空间信息失败:', error)
      if (shouldToast) toast.error('更新空间信息失败')
    }
  }

  const updateTemplates = async (templates: SpaceTaskTemplate[]) => {
    if (!currentSpace.value) return

    try {
      await updateSpace(
        currentSpace.value.id,
        {
          taskTemplates: JSON.stringify(templates),
        },
        false
      )
    } catch (error) {
      console.error('更新模板失败:', error)
      toast.error('更新模板失败')
    }
  }

  const deleteTemplate = async (index: number) => {
    if (!currentSpace.value) return

    const updatedTemplates = templates.value.filter((_, i) => i !== index)
    await updateTemplates(updatedTemplates)
  }

  const updateAnnouncements = async (announcements: SpaceAnnouncement[]) => {
    if (!currentSpace.value) return

    try {
      await updateSpace(
        currentSpace.value.id,
        {
          announcements: JSON.stringify(announcements),
        },
        false
      )
    } catch (error) {
      console.error('更新公告失败:', error)
      toast.error('更新公告失败')
    }
  }

  const addAnnouncement = async (announcement: SpaceAnnouncement) => {
    const updatedAnnouncements = [...announcements.value, announcement]
    await updateAnnouncements(updatedAnnouncements)
  }

  const updateAnnouncement = async (index: number, announcement: SpaceAnnouncement) => {
    const updatedAnnouncements = [...announcements.value]
    updatedAnnouncements[index] = announcement
    await updateAnnouncements(updatedAnnouncements)
  }

  const deleteAnnouncement = async (index: number) => {
    const updatedAnnouncements = announcements.value.filter((_, i) => i !== index)
    await updateAnnouncements(updatedAnnouncements)
  }

  const updateClassificationTopics = async (topicIds: number[]) => {
    if (!currentSpace.value) return

    try {
      await updateSpace(currentSpace.value.id, { classificationTopics: topicIds }, false)
    } catch (error) {
      console.error('更新分类话题失败:', error)
      toast.error('更新分类话题失败')
    }
  }

  const addClassificationTopic = async (topicId: number) => {
    const updatedTopicIds = [...classificationTopics.value.map((topic) => topic.id), topicId]
    await updateClassificationTopics(updatedTopicIds)
  }

  const addClassificationTopics = async (topicIds: number[]) => {
    const updatedTopicIds = [...classificationTopics.value.map((topic) => topic.id), ...topicIds]
    await updateClassificationTopics(updatedTopicIds)
  }

  const deleteClassificationTopic = async (topicId: number) => {
    const updatedTopicIds = classificationTopics.value.map((topic) => topic.id).filter((id) => id !== topicId)
    await updateClassificationTopics(updatedTopicIds)
  }

  return {
    currentSpace,
    currentSpaceId,
    templates,
    announcements,
    classificationTopics,
    fetchSpace,
    updateSpace,
    updateTemplates,
    deleteTemplate,
    updateAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateClassificationTopics,
    addClassificationTopic,
    addClassificationTopics,
    deleteClassificationTopic,
  }
})
