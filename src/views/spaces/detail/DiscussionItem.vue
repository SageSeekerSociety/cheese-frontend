<template>
  <v-container fluid class="discussion-item-page pa-0 ma-0">
    <div v-if="isLoading" class="loading-container">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <v-alert v-else-if="errorLoading" type="error" variant="tonal" prominent class="ma-4">
      {{ t('spaces.discussions.loadFailed') }}: {{ errorLoading }}
      <template #append>
        <v-btn color="error" variant="outlined" class="ml-4" @click="goBack">
          {{ t('spaces.discussions.backToDiscussions') }}
        </v-btn>
      </template>
    </v-alert>
    <div v-else-if="!discussion" class="empty-state-container">
      <v-icon size="64" class="mb-4 text-medium-emphasis">mdi-comment-question-outline</v-icon>
      <p class="text-h6">{{ t('spaces.discussions.discussionNotFound') }}</p>
      <v-btn color="primary" class="mt-4" @click="goBack">{{ t('spaces.discussions.backToDiscussions') }}</v-btn>
    </div>

    <template v-else>
      <!-- 内容区域 -->
      <v-sheet rounded="lg" class="content-area">
        <!-- 顶部工具栏 -->
        <div class="discussion-toolbar px-4 py-2">
          <div class="d-flex align-center">
            <v-btn icon variant="text" class="mr-2" @click="goBack">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div class="text-h6 text-truncate font-weight-medium">
              {{ getDiscussionTitle(discussion.content) || t('spaces.discussions.untitled') }}
            </div>
            <v-spacer></v-spacer>
            <v-btn icon variant="text" density="comfortable" class="discussion-action-btn">
              <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
          </div>
        </div>
        <v-divider></v-divider>

        <!-- 主讨论内容 -->
        <div class="main-discussion-container px-4 pt-4 pb-2">
          <DiscussionItemComponent
            v-if="discussion"
            :discussion="discussion"
            :reaction-types="reactionTypes"
            class="main-discussion"
            @toggle-reaction="(id, typeId) => handleToggleReaction(id, typeId, 'main')"
            @reply="prepareReplyToMainDiscussion"
            @delete="handleDeleteDiscussion"
          />
        </div>

        <v-divider class="my-2"></v-divider>

        <!-- 回复区域 -->
        <div class="replies-container px-4 py-2">
          <div class="d-flex align-center mb-4">
            <h2 class="text-subtitle-1 font-weight-medium">
              {{ t('spaces.discussions.repliesCount', { count: subDiscussionsPageInfo.total || 0 }) }}
            </h2>
            <v-spacer></v-spacer>
            <v-btn
              v-if="!showReplyInputState.visible"
              color="primary"
              variant="text"
              density="comfortable"
              prepend-icon="mdi-reply"
              @click="prepareReplyToMainDiscussion"
            >
              {{ t('spaces.discussions.reply') }}
            </v-btn>
          </div>

          <ReplyInput
            v-if="showReplyInputState.visible && showReplyInputState.parentId === discussion?.id"
            :parent-id="discussion!.id"
            :model-type="discussion!.modelType"
            :model-id="discussion!.modelId"
            :placeholder="t('spaces.discussions.replyPlaceholder')"
            class="mb-4 reply-input-container"
            @reply-submitted="handleReplySubmitted"
            @cancel-reply="cancelReplyInput"
          />

          <InfiniteScroll
            :loading="isLoadingMoreReplies"
            :has-more="subDiscussionsPageInfo.hasMore"
            :initial-loading="false"
            :is-empty="!isLoadingMoreReplies && replies.length === 0 && !showReplyInputState.visible"
            class="replies-list"
            @load-more="loadMoreReplies"
          >
            <div v-if="replies.length > 0" class="replies-list-container">
              <template v-for="reply in replies" :key="reply.id">
                <DiscussionItemComponent
                  :discussion="reply"
                  :reaction-types="reactionTypes"
                  is-reply
                  class="mb-2"
                  @toggle-reaction="(id, typeId) => handleToggleReaction(id, typeId, 'reply')"
                  @reply="prepareReplyToReply(reply)"
                  @delete="handleDeleteReply(reply)"
                />
                <ReplyInput
                  v-if="showReplyInputState.visible && showReplyInputState.parentId === reply.id"
                  :parent-id="reply.id"
                  :model-type="reply.modelType"
                  :model-id="reply.modelId"
                  :placeholder="t('spaces.discussions.replyToUserPlaceholder', { user: reply.sender.nickname ?? '' })"
                  class="mt-2 ml-4 mb-3 nested-reply-input"
                  autofocus
                  @reply-submitted="handleReplySubmitted"
                  @cancel-reply="cancelReplyInput"
                />
              </template>
            </div>
            <template #empty>
              <div v-if="!showReplyInputState.visible" class="empty-replies-message">
                <v-icon size="48" class="text-medium-emphasis mb-2">mdi-comment-outline</v-icon>
                <p class="text-medium-emphasis text-body-1">{{ t('spaces.discussions.noRepliesYet') }}</p>
                <v-btn color="primary" class="mt-3" variant="outlined" @click="prepareReplyToMainDiscussion">
                  {{ t('spaces.discussions.beFirstToReply') }}
                </v-btn>
              </div>
            </template>
          </InfiniteScroll>
        </div>
      </v-sheet>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import type { DiscussionWithUI, Page, ReactionType } from '@/types'

import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'

import { getFullAttachmentUrl } from '@/utils/materials'
import { setTitle } from '@/utils/title'

import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import DiscussionItemComponent from '@/components/discussions/DiscussionItem.vue'
import ReplyInput from '@/components/discussions/ReplyInput.vue'
import { AttachmentsApi } from '@/network/api/attachments'
import { DiscussionsApi } from '@/network/api/discussions'
import { useDialog } from '@/plugins/dialog'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const dialog = useDialog()

const discussion = ref<DiscussionWithUI | null>(null)
const replies = ref<DiscussionWithUI[]>([])
const reactionTypes = ref<ReactionType[]>([])
const isLoading = ref(true)
const errorLoading = ref<string | null>(null)
const isLoadingMoreReplies = ref(false)

// Unified state for reply input visibility and target
const showReplyInputState = ref<{ visible: boolean; parentId: number | null }>({ visible: false, parentId: null })

const repliesPageSize = 15
const subDiscussionsPageInfo = ref<Page>({
  pageStart: 1,
  pageSize: repliesPageSize,
  hasMore: true,
  nextStart: 1,
  total: 0,
})

const spaceId = computed(() => Number(route.params.spaceId))
const discussionId = computed(() => Number(route.params.discussionId))

const mainDiscussionImage = ref<{ url: string; aspectRatio?: number } | null>(null)

const fetchDiscussionDetail = async () => {
  isLoading.value = true
  errorLoading.value = null
  try {
    const { data } = await DiscussionsApi.getDetail(discussionId.value, {
      pageSize: repliesPageSize,
      sort_by: 'createdAt',
      sort_order: 'asc',
    })
    discussion.value = data.discussion as DiscussionWithUI

    if (data.subDiscussions) {
      replies.value = data.subDiscussions.discussions as DiscussionWithUI[]
      subDiscussionsPageInfo.value = data.subDiscussions.page
    } else {
      replies.value = []
      subDiscussionsPageInfo.value = { ...subDiscussionsPageInfo.value, hasMore: false, total: 0, nextStart: 0 }
    }
    setTitle(getDiscussionTitle(discussion.value?.content || '') || t('spaces.discussions.title'), route)
  } catch (err: any) {
    console.error('Failed to load discussion detail:', err)
    errorLoading.value = err.message || 'Unknown error'
    toast.error(t('spaces.discussions.loadFailed'))
  }
  isLoading.value = false
}

const loadMoreReplies = async () => {
  if (!discussion.value || !subDiscussionsPageInfo.value.hasMore || isLoadingMoreReplies.value) return
  isLoadingMoreReplies.value = true
  try {
    const { data } = await DiscussionsApi.listSubDiscussions(discussionId.value, {
      pageStart: subDiscussionsPageInfo.value.nextStart,
      pageSize: repliesPageSize,
      sort_by: 'createdAt',
      sort_order: 'asc',
    })
    replies.value.push(...(data.discussions as DiscussionWithUI[]))
    subDiscussionsPageInfo.value = data.page
  } catch (err) {
    console.error('Failed to load more replies:', err)
    toast.error(t('spaces.discussions.loadFailed'))
  }
  isLoadingMoreReplies.value = false
}

const fetchReactionTypes = async () => {
  try {
    const { data } = await DiscussionsApi.getAllReactionTypes()
    reactionTypes.value = data.reactionTypes
  } catch (error) {
    console.error('Failed to load reaction types:', error)
    // Consider a toast error if this is critical, e.g., t('global.errorMessages.reactionTypesLoadFailed')
  }
}

const handleToggleReaction = async (
  targetDiscussionId: number,
  reactionTypeId: number,
  targetContext: 'main' | 'reply'
) => {
  try {
    const { data: reactionAPIResult } = await DiscussionsApi.reactToDiscussion(targetDiscussionId, reactionTypeId)
    const updatedReactionFromAPI = reactionAPIResult.reaction

    let itemToUpdate: DiscussionWithUI | undefined

    if (targetContext === 'main' && discussion.value && discussion.value.id === targetDiscussionId) {
      itemToUpdate = discussion.value
    } else if (targetContext === 'reply') {
      itemToUpdate = replies.value.find((r) => r.id === targetDiscussionId)
    }

    if (itemToUpdate) {
      if (!itemToUpdate.reactions) {
        itemToUpdate.reactions = []
      }
      const reactionIdx = itemToUpdate.reactions.findIndex((r) => r.reactionType.id === reactionTypeId)

      if (reactionIdx !== -1) {
        itemToUpdate.reactions[reactionIdx].count = updatedReactionFromAPI.count
        itemToUpdate.reactions[reactionIdx].hasReacted = updatedReactionFromAPI.hasReacted
      } else {
        if (updatedReactionFromAPI.count > 0) {
          // Only add if it's a meaningful reaction with initial count
          itemToUpdate.reactions.push(updatedReactionFromAPI)
        }
      }
      // Filter out reactions that are no longer relevant (e.g., count is 0 and user hasn't reacted)
      itemToUpdate.reactions = itemToUpdate.reactions.filter((r) => r.count > 0 || r.hasReacted)

      // Manually trigger reactivity for nested objects if Vue doesn't pick it up
      // For ref objects (like discussion.value), re-assigning the object might be needed if direct mutation isn't enough.
      // For arrays (like replies.value), finding the index and replacing the item is robust.
      if (targetContext === 'main') {
        discussion.value = { ...itemToUpdate }
      } else {
        const replyIndex = replies.value.findIndex((r) => r.id === targetDiscussionId)
        if (replyIndex > -1) {
          replies.value.splice(replyIndex, 1, { ...itemToUpdate })
        }
      }
    }
  } catch (error) {
    toast.error(t('global.errorMessages.reactionFailed'))
    console.error('Failed to update reaction:', error)
  }
}

const prepareReplyToMainDiscussion = () => {
  if (!discussion.value) return
  showReplyInputState.value = { visible: true, parentId: discussion.value.id }
}

const prepareReplyToReply = (replyTarget: DiscussionWithUI) => {
  showReplyInputState.value = { visible: true, parentId: replyTarget.id }
}

const handleReplySubmitted = (newReply: DiscussionWithUI) => {
  replies.value.unshift(newReply) // Add to the beginning of the list
  if (discussion.value && discussion.value.subDiscussions) {
    discussion.value.subDiscussions.count = (discussion.value.subDiscussions.count || 0) + 1
  }
  subDiscussionsPageInfo.value.total = (subDiscussionsPageInfo.value.total || 0) + 1
  cancelReplyInput()
  toast.success(t('global.replySuccess'))
}

const cancelReplyInput = () => {
  showReplyInputState.value = { visible: false, parentId: null }
}

const handleDeleteDiscussion = async () => {
  if (!discussion.value) return
  const confirmed = await dialog.confirm(t('spaces.discussions.deleteConfirm')).wait()
  if (confirmed) {
    try {
      await DiscussionsApi.deleteDiscussion(discussion.value.id)
      toast.success(t('spaces.discussions.deleteSuccess'))
      router.push({ name: 'SpacesDetailDiscussions', params: { spaceId: spaceId.value } })
    } catch (error) {
      toast.error(t('spaces.discussions.deleteFailed'))
      console.error('Failed to delete discussion:', error)
    }
  }
}

const handleDeleteReply = async (replyToDelete: DiscussionWithUI) => {
  const confirmed = await dialog.confirm(t('global.confirmDeleteReply')).wait()
  if (confirmed) {
    try {
      await DiscussionsApi.deleteDiscussion(replyToDelete.id)
      replies.value = replies.value.filter((r) => r.id !== replyToDelete.id)
      if (discussion.value && discussion.value.subDiscussions) {
        discussion.value.subDiscussions.count = Math.max(0, (discussion.value.subDiscussions.count || 0) - 1)
      }
      subDiscussionsPageInfo.value.total = Math.max(0, (subDiscussionsPageInfo.value.total || 0) - 1)
      toast.success(t('global.deleteSuccess'))
    } catch (error) {
      toast.error(t('global.deleteFailed'))
      console.error('Failed to delete reply:', error)
    }
  }
}

const getDiscussionTitle = (contentString?: string): string => {
  if (!contentString) return ''
  try {
    const parsedContent = JSON.parse(contentString)
    if (parsedContent.content && parsedContent.content.length > 0) {
      const firstNode = parsedContent.content[0]
      if (firstNode.type === 'heading' && firstNode.attrs?.level === 1 && firstNode.content?.[0]?.text) {
        return firstNode.content[0].text.trim()
      }
      for (const node of parsedContent.content) {
        if (node.type === 'paragraph' && node.content) {
          const text = node.content
            .map((n: any) => n.text || '')
            .join('')
            .trim()
          if (text) return text.substring(0, 70) + (text.length > 70 ? '...' : '')
        }
      }
    }
  } catch (e) {
    /* Ignore parsing error, will fallback */
  }
  const plainText = contentString.replace(/<[^>]*>/g, '').trim()
  return plainText.substring(0, 70) + (plainText.length > 70 ? '...' : '')
}

const goBack = () => {
  if (router.options.history.state.back) {
    router.back()
  } else {
    router.push({ name: 'SpacesDetailDiscussions', params: { spaceId: spaceId.value } })
  }
}

watch(discussionId, (newId, oldId) => {
  if (newId !== oldId && newId !== undefined) {
    fetchDiscussionDetail()
    if (reactionTypes.value.length === 0) {
      // Fetch reaction types only if not already fetched
      fetchReactionTypes()
    }
  }
})

onMounted(() => {
  fetchDiscussionDetail()
  fetchReactionTypes()
})
</script>

<style scoped lang="scss">
.discussion-item-page {
  display: flex;
  flex-direction: column;
}

.loading-container,
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 32px;
}

.discussion-toolbar {
  position: sticky;
  top: 0;
  z-index: 4;
  background-color: rgba(var(--v-theme-surface), 0.15);
  backdrop-filter: blur(10px);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.main-discussion {
  position: relative;
}

.replies-list-container {
  border-left: 2px solid rgba(var(--v-theme-primary), 0.1);
  padding-left: 12px;
  margin-left: 4px;
}

.reply-input-container {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.nested-reply-input {
  border-radius: 6px;
  padding: 6px;
}

.empty-replies-message {
  text-align: center;
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.discussion-action-btn {
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(var(--v-theme-on-surface), 0.05);
  }
}
</style>
