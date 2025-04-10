import type { Space, SpaceAnnouncement, SpaceCategory, SpaceTaskTemplate, Topic } from '@/types'

import { computed, ref } from 'vue'
import { toast } from 'vuetify-sonner'
import { defineStore } from 'pinia'

import { SpacesApi } from '@/network/api/spaces'
import { PatchSpaceRequestData } from '@/network/api/spaces/types'

export const useSpaceStore = defineStore('space', () => {
  const currentSpace = ref<Space | null>(null)
  const currentSpaceId = ref<number | null>(null)
  const categories = ref<SpaceCategory[]>([])
  const loadingCategories = ref(false)

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
      categories.value = []
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

  const updateSpace = async (spaceId: number, data: PatchSpaceRequestData, showToast = true) => {
    try {
      const response = await SpacesApi.update(spaceId, data)
      currentSpace.value = response.data.space
      if (showToast) {
        toast.success('更新空间信息成功')
      }
    } catch (error) {
      console.error('更新空间信息失败:', error)
      if (showToast) {
        toast.error('更新空间信息失败')
      }
      throw error
    }
  }

  const updateTemplates = async (newTemplates: SpaceTaskTemplate[]) => {
    if (!currentSpace.value) return

    try {
      await updateSpace(currentSpace.value.id, { taskTemplates: JSON.stringify(newTemplates) }, false)
    } catch (error) {
      console.error('更新模板失败:', error)
      toast.error('更新模板失败')
      throw error
    }
  }

  const deleteTemplate = async (index: number) => {
    const newTemplates = [...templates.value]
    newTemplates.splice(index, 1)
    await updateTemplates(newTemplates)
  }

  const updateAnnouncements = async (newAnnouncements: SpaceAnnouncement[]) => {
    if (!currentSpace.value) return

    try {
      await updateSpace(currentSpace.value.id, { announcements: JSON.stringify(newAnnouncements) }, false)
    } catch (error) {
      console.error('更新公告失败:', error)
      toast.error('更新公告失败')
      throw error
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

  // Categories related methods
  const fetchCategories = async (includeArchived = false) => {
    if (!currentSpaceId.value) return

    loadingCategories.value = true
    try {
      const { data } = await SpacesApi.listCategories(currentSpaceId.value, { includeArchived })
      categories.value = data.categories
    } catch (error) {
      console.error('获取分类失败:', error)
      toast.error('获取分类失败')
    } finally {
      loadingCategories.value = false
    }
  }

  const createCategory = async (name: string, description?: string | null, displayOrder?: number) => {
    if (!currentSpaceId.value) return

    try {
      await SpacesApi.createCategory(currentSpaceId.value, { name, description, displayOrder })
      await fetchCategories()
      toast.success('创建分类成功')
    } catch (error) {
      console.error('创建分类失败:', error)
      toast.error('创建分类失败')
      throw error
    }
  }

  const updateCategory = async (
    categoryId: number,
    data: { name?: string; description?: string | null; displayOrder?: number }
  ) => {
    if (!currentSpaceId.value) return

    try {
      await SpacesApi.updateCategory(currentSpaceId.value, categoryId, data)
      await fetchCategories()
      toast.success('更新分类成功')
    } catch (error) {
      console.error('更新分类失败:', error)
      toast.error('更新分类失败')
      throw error
    }
  }

  const deleteCategory = async (categoryId: number) => {
    if (!currentSpaceId.value) return

    try {
      await SpacesApi.deleteCategory(currentSpaceId.value, categoryId)
      await fetchCategories()
      toast.success('删除分类成功')
    } catch (error) {
      console.error('删除分类失败:', error)
      toast.error('删除分类失败')
      throw error
    }
  }

  const archiveCategory = async (categoryId: number) => {
    if (!currentSpaceId.value) return

    try {
      await SpacesApi.archiveCategory(currentSpaceId.value, categoryId)
      await fetchCategories()
      toast.success('归档分类成功')
    } catch (error) {
      console.error('归档分类失败:', error)
      toast.error('归档分类失败')
      throw error
    }
  }

  const unarchiveCategory = async (categoryId: number) => {
    if (!currentSpaceId.value) return

    try {
      await SpacesApi.unarchiveCategory(currentSpaceId.value, categoryId)
      await fetchCategories()
      toast.success('恢复分类成功')
    } catch (error) {
      console.error('恢复分类失败:', error)
      toast.error('恢复分类失败')
      throw error
    }
  }

  const setDefaultCategory = async (categoryId: number) => {
    if (!currentSpaceId.value || !currentSpace.value) return

    try {
      await updateSpace(currentSpace.value.id, { defaultCategoryId: categoryId }, false)
      toast.success('设置默认分类成功')
    } catch (error) {
      console.error('设置默认分类失败:', error)
      toast.error('设置默认分类失败')
      throw error
    }
  }

  return {
    currentSpace,
    currentSpaceId,
    templates,
    announcements,
    classificationTopics,
    categories,
    loadingCategories,
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
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
    unarchiveCategory,
    setDefaultCategory,
  }
})
