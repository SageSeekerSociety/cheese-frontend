import type { DiscussableModelType, Discussion, DiscussionWithUI, ReactionType } from '@/types'

import { ref } from 'vue'
import { JSONContent } from 'vuetify-pro-tiptap'
import { defineStore } from 'pinia'

import { DiscussionsApi } from '@/network/api/discussions'

export const useDiscussionStore = defineStore('discussion', () => {
  // 核心状态
  const currentDiscussion = ref<DiscussionWithUI | null>(null)
  const loading = ref(false)
  const loadingReplies = ref(false)
  const error = ref('')
  const reactionTypes = ref<ReactionType[]>([])

  // 讨论列表 - 按频道存储
  const discussionsByChannel = ref<Record<string, DiscussionWithUI[]>>({})

  // 加载讨论详情
  const loadDiscussion = async (
    discussionId: number,
    params?: {
      page_start?: number
      page_size?: number
      sort_by?: 'createdAt' | 'updatedAt'
      sort_order?: 'asc' | 'desc'
    }
  ) => {
    loading.value = true
    error.value = ''

    try {
      const response = await DiscussionsApi.getDetail(discussionId, params)

      // 转换为 DiscussionWithUI 类型
      currentDiscussion.value = {
        ...response.data.discussion,
        attachments: [],
        links: [],
      }

      // 设置子讨论
      if (response.data.subDiscussions?.discussions) {
        currentDiscussion.value.subDiscussions = {
          count: response.data.subDiscussions.page.total ?? response.data.subDiscussions.discussions.length,
          examples: response.data.subDiscussions.discussions.map((discussion: Discussion) => ({
            ...discussion,
            attachments: [],
            links: [],
          })),
        }
      }
    } catch (e) {
      console.error('加载讨论数据失败', e)
      error.value = '加载讨论数据失败，请重试'
    } finally {
      loading.value = false
    }
  }

  // 加载子讨论
  const loadSubDiscussions = async (
    discussionId: number,
    params?: {
      page_start?: number
      page_size?: number
      sort_by?: 'createdAt' | 'updatedAt'
      sort_order?: 'asc' | 'desc'
    }
  ) => {
    if (!currentDiscussion.value) return

    loadingReplies.value = true

    try {
      const response = await DiscussionsApi.listSubDiscussions(discussionId, {
        sort_order: 'asc',
        ...params,
      })

      // 转换为 DiscussionWithUI 类型
      const replies = response.data.discussions.map((discussion) => ({
        ...discussion,
        attachments: [],
        links: [],
      }))

      // 更新子讨论
      if (!currentDiscussion.value.subDiscussions) {
        currentDiscussion.value.subDiscussions = {
          count: response.data.page.total ?? replies.length,
          examples: replies,
        }
      } else {
        // 如果是加载更多,则追加
        if (params?.page_start) {
          currentDiscussion.value.subDiscussions.examples.push(...replies)
        } else {
          // 否则替换
          currentDiscussion.value.subDiscussions.examples = replies
        }
        currentDiscussion.value.subDiscussions.count = response.data.page.total ?? replies.length
      }
    } catch (e) {
      console.error('加载子讨论失败', e)
    } finally {
      loadingReplies.value = false
    }
  }

  // 按频道加载讨论列表
  const loadDiscussionsByChannel = async (modelId: number, modelType: DiscussableModelType = 'PROJECT') => {
    loading.value = true

    try {
      const response = await DiscussionsApi.list({
        modelId,
        modelType,
        sort_order: 'desc',
      })

      // 转换为 DiscussionWithUI 类型
      discussionsByChannel.value[String(modelId)] = response.data.discussions.map((discussion) => ({
        ...discussion,
        attachments: [],
        links: [],
      }))
    } catch (e) {
      console.error('加载频道讨论列表失败', e)
    } finally {
      loading.value = false
    }
  }

  // 发送新讨论
  const createDiscussion = async (
    content: JSONContent,
    modelId: number,
    modelType: DiscussableModelType = 'PROJECT'
  ) => {
    const response = await DiscussionsApi.create({
      content: JSON.stringify(content),
      modelId,
      modelType,
    })

    const discussionWithUI: DiscussionWithUI = {
      ...response.data.discussion,
      attachments: [],
      links: [],
    }

    // 添加到列表
    if (discussionsByChannel.value[String(modelId)]) {
      discussionsByChannel.value[String(modelId)].unshift(discussionWithUI)
    }

    return discussionWithUI
  }

  // 发送回复
  const replyToDiscussion = async (
    parentId: number,
    content: JSONContent,
    modelId: number,
    modelType: DiscussableModelType = 'PROJECT'
  ) => {
    const response = await DiscussionsApi.create({
      content: JSON.stringify(content),
      modelId,
      modelType,
      parentId,
    })

    const replyWithUI: DiscussionWithUI = {
      ...response.data.discussion,
      attachments: [],
      links: [],
    }

    // 如果是当前讨论的回复，添加到当前讨论
    if (currentDiscussion.value && currentDiscussion.value.id === parentId) {
      if (!currentDiscussion.value.subDiscussions) {
        currentDiscussion.value.subDiscussions = {
          count: 1,
          examples: [replyWithUI],
        }
      } else {
        currentDiscussion.value.subDiscussions.examples.push(replyWithUI)
        currentDiscussion.value.subDiscussions.count += 1
      }
    }

    return replyWithUI
  }

  // 加载表情类型
  const loadReactionTypes = async () => {
    try {
      const response = await DiscussionsApi.getAllReactionTypes()
      reactionTypes.value = response.data.reactionTypes
    } catch (e) {
      console.error('加载表情类型失败', e)
    }
  }

  // 添加表情反应
  const toggleReaction = async (discussionId: number, reactionTypeId: number) => {
    const response = await DiscussionsApi.reactToDiscussion(discussionId, reactionTypeId)
    const updatedReaction = response.data.reaction

    // 更新当前讨论的反应
    if (currentDiscussion.value?.id === discussionId) {
      const reactions = currentDiscussion.value.reactions || []
      const existingIndex = reactions.findIndex((r) => r.reactionType.id === reactionTypeId)

      if (existingIndex !== -1) {
        reactions[existingIndex] = updatedReaction
      } else {
        reactions.push(updatedReaction)
      }

      currentDiscussion.value.reactions = reactions
    }

    // 更新讨论列表中的反应
    for (const channelId in discussionsByChannel.value) {
      const discussion = discussionsByChannel.value[channelId].find((d) => d.id === discussionId)
      if (discussion) {
        const reactions = discussion.reactions || []
        const existingIndex = reactions.findIndex((r) => r.reactionType.id === reactionTypeId)

        if (existingIndex !== -1) {
          reactions[existingIndex] = updatedReaction
        } else {
          reactions.push(updatedReaction)
        }

        discussion.reactions = reactions
        break
      }
    }
  }

  // 删除讨论
  const deleteDiscussion = async (discussionId: number) => {
    await DiscussionsApi.deleteDiscussion(discussionId)

    // 从列表中移除
    for (const channelId in discussionsByChannel.value) {
      discussionsByChannel.value[channelId] = discussionsByChannel.value[channelId].filter((d) => d.id !== discussionId)
    }

    // 如果是当前讨论,清除它
    if (currentDiscussion.value?.id === discussionId) {
      currentDiscussion.value = null
    }
  }

  // 清除当前讨论
  const clearCurrentDiscussion = () => {
    currentDiscussion.value = null
    error.value = ''
  }

  return {
    // 状态
    currentDiscussion,
    loading,
    loadingReplies,
    error,
    discussionsByChannel,
    reactionTypes,

    // 动作
    loadDiscussion,
    loadSubDiscussions,
    loadDiscussionsByChannel,
    createDiscussion,
    replyToDiscussion,
    deleteDiscussion,
    toggleReaction,
    loadReactionTypes,
    clearCurrentDiscussion,
  }
})
