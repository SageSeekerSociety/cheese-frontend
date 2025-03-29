<template>
  <div class="discussion-detail-container">
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container py-8">
      <v-progress-circular indeterminate color="primary" class="mx-auto d-block"></v-progress-circular>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state py-8 text-center">
      <v-icon icon="mdi-alert-circle-outline" size="64" color="error" class="mb-4"></v-icon>
      <div class="text-h6 mb-2">{{ error }}</div>
      <v-btn flat color="primary" class="mt-4" @click="goBack">返回</v-btn>
    </div>

    <!-- 讨论内容 -->
    <template v-else>
      <!-- 消息内容区域 -->
      <div v-if="currentMessage" class="message-area flex-grow-1 px-4 pt-3">
        <!-- 原始消息 -->
        <div class="message-thread mb-2">
          <!-- 主消息 -->
          <DiscussionItem
            :discussion="currentMessage"
            :reaction-types="discussionStore.reactionTypes"
            @toggle-reaction="toggleReaction"
          />

          <!-- 回复列表 -->
          <div
            v-if="currentMessage.subDiscussions && currentMessage.subDiscussions.examples.length > 0"
            class="replies-section mt-3 ml-5"
          >
            <div class="replies-header d-flex align-center pa-2 mb-2 reply-counter">
              <v-icon icon="mdi-forum-outline" size="small" class="mr-2"></v-icon>
              <span class="text-body-2 font-weight-medium">{{ currentMessage.subDiscussions.count }} 条回复</span>

              <div v-if="hasMoreReplies" class="ml-auto">
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  class="text-caption"
                  :loading="loadingMoreReplies"
                  @click="loadMoreReplies"
                >
                  加载更多回复
                </v-btn>
              </div>
            </div>

            <!-- 加载中状态 -->
            <div v-if="loadingReplies && !currentMessage.subDiscussions.examples.length" class="pa-4 text-center">
              <v-progress-circular indeterminate color="primary" size="24" width="2"></v-progress-circular>
            </div>

            <!-- 回复列表 -->
            <ReplyList
              :discussion-id="currentMessage.id"
              :parent-discussion="currentMessage"
              :replies="currentMessage.subDiscussions.examples"
              :expanded="true"
              :show-header="false"
              @reply-to-reply="handleReplyToReply"
              @delete-reply="handleDeleteReply"
            />
          </div>

          <!-- 没有回复时显示的内容 -->
          <div v-else-if="!loadingReplies" class="no-replies-container ml-5 mt-4 pa-4 text-center">
            <div class="text-body-2 text-medium-emphasis">暂无回复</div>
          </div>

          <!-- 回复加载中 -->
          <div v-else class="ml-5 mt-4 pa-4 text-center">
            <v-progress-circular indeterminate color="primary" size="24" width="2"></v-progress-circular>
          </div>
        </div>
      </div>

      <div v-else class="empty-state text-center py-12">
        <v-icon icon="mdi-comment-alert-outline" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
        <h3 class="text-h6 font-weight-medium mb-2">讨论不存在</h3>
        <p class="text-body-2 text-medium-emphasis mb-6">无法找到指定的讨论，或者该讨论已被删除</p>
        <v-btn color="primary" prepend-icon="mdi-arrow-left" @click="goBack"> 返回频道 </v-btn>
      </div>

      <!-- 消息输入区 -->
      <div v-if="currentMessage" class="message-input-container px-4 pb-4">
        <!-- 显示回复上下文 -->
        <div v-if="replyingTo" class="reply-context pa-2 mb-2 d-flex align-center">
          <div class="flex-grow-1 d-flex align-center">
            <v-icon class="mr-2 text-medium-emphasis" size="small">mdi-reply</v-icon>
            <span class="text-caption text-medium-emphasis">
              回复给
              <strong>
                {{ replyingTo.sender?.nickname || currentMessage.sender.nickname }}
              </strong>
            </span>
            <div v-if="replyingTo.content" class="reply-preview text-caption text-truncate ml-2 px-2 py-1">
              {{ replyingTo.content.substring(0, 50) + (replyingTo.content.length > 50 ? '...' : '') }}
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" size="small" @click="cancelReply"></v-btn>
        </div>

        <div class="editor-container" :class="{ 'is-active': replyContent?.text?.trim() !== '' }">
          <v-textarea
            v-model="replyContent"
            variant="plain"
            rows="2"
            placeholder="发送回复..."
            hide-details
            class="detail-reply-textarea"
            @keydown.ctrl.enter="sendReply"
          ></v-textarea>
        </div>

        <div v-if="selectedFiles.length > 0" class="selected-files px-2 pt-2 pb-1">
          <v-chip
            v-for="(file, index) in selectedFiles"
            :key="index"
            closable
            size="small"
            variant="tonal"
            color="primary"
            class="mr-2 mb-2"
            @click:close="removeFile(index)"
          >
            <v-icon start size="small">{{ getFileIcon(file.type) }}</v-icon>
            {{ file.name }}
          </v-chip>
        </div>

        <div class="d-flex justify-end align-center ga-4 px-2 pt-2">
          <v-btn
            variant="text"
            prepend-icon="mdi-attachment"
            size="small"
            class="text-medium-emphasis mr-auto"
            @click="openFileSelector"
          >
            附件
          </v-btn>

          <span class="text-caption text-medium-emphasis mr-3">Ctrl+Enter 发送</span>

          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            :loading="sendingReply"
            :disabled="!canSendReply"
            @click="sendReply"
          >
            回复
            <v-icon end>mdi-reply</v-icon>
          </v-btn>
        </div>

        <!-- 文件选择器 -->
        <input ref="fileInput" type="file" style="display: none" multiple @change="handleFileSelected" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { Discussion } from '@/types'

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { JSONContent } from 'vuetify-pro-tiptap'

import DiscussionItem from '@/components/discussions/DiscussionItem.vue'
import ReplyList from '@/components/discussions/ReplyList.vue'
import { useDialog } from '@/plugins/dialog'
import { currentUserId } from '@/services/account'
import { useDiscussionStore } from '@/stores/discussionStore'

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const discussionStore = useDiscussionStore()

// 获取路由参数
const discussionId = computed(() => Number(route.params.discussionId))
const teamId = computed(() => route.params.teamId as string)
const channelId = computed(() => route.query.channelId as string)
const channelName = computed(() => route.query.channelName as string)

// 状态变量
const loading = computed(() => discussionStore.loading)
const loadingReplies = computed(() => discussionStore.loadingReplies)
const error = computed(() => discussionStore.error)
const currentMessage = computed(() => discussionStore.currentDiscussion)
const replyContent = ref<JSONContent | null>(null)
const sendingReply = ref(false)
const selectedFiles = ref<File[]>([])
const replyingTo = ref<any | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMoreReplies = ref(false)
const loadingMoreReplies = ref(false)

// 计算当前用户是否为消息发送者
const isCurrentUserMessage = computed(
  () => currentMessage.value && currentMessage.value.sender.id === currentUserId.value
)

// 发送回复
const sendReply = async () => {
  if (!replyContent.value?.text?.trim() && selectedFiles.value.length === 0) return

  sendingReply.value = true

  try {
    // 调用 store 发送回复
    await discussionStore.replyToDiscussion(
      discussionId.value,
      replyContent.value as JSONContent,
      Number(channelId.value || 0),
      'PROJECT'
    )

    // 清空输入框和已选文件
    replyContent.value = null
    selectedFiles.value = []
    replyingTo.value = null
  } catch (error) {
    console.error('发送回复失败', error)
    dialog.alert('发送回复失败，请重试', { title: '错误' })
  } finally {
    sendingReply.value = false
  }
}

// 加载更多回复
const loadMoreReplies = async () => {
  if (!currentMessage.value || loadingMoreReplies.value) return

  loadingMoreReplies.value = true

  try {
    // 计算下一页的起始ID
    const lastReply =
      currentMessage.value.subDiscussions?.examples?.[currentMessage.value.subDiscussions.examples.length - 1]
    const pageStart = lastReply ? lastReply.id : undefined

    // 调用API加载更多回复
    await discussionStore.loadSubDiscussions(discussionId.value, {
      page_start: pageStart,
      page_size: pageSize.value,
    })

    // 更新页码
    currentPage.value += 1

    // 根据返回的数据判断是否还有更多回复
    hasMoreReplies.value =
      !!currentMessage.value?.subDiscussions &&
      currentMessage.value.subDiscussions.count > currentMessage.value.subDiscussions.examples.length
  } catch (error) {
    console.error('加载更多回复失败', error)
  } finally {
    loadingMoreReplies.value = false
  }
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
}

// 添加反应
const toggleReaction = async (discussionId: number, reactionTypeId: number) => {
  if (!currentMessage.value) return

  try {
    await discussionStore.toggleReaction(discussionId, reactionTypeId)
  } catch (error) {
    console.error('添加反应失败', error)
  }
}

// 返回上一页
const goBack = () => {
  console.log('goBack', teamId.value, channelId.value)
  router.push({
    name: 'TeamsDetailChannels',
    params: {
      teamId: teamId.value,
      channelId: channelId.value,
    },
  })
}

// 检查是否可以发送回复
const canSendReply = computed(() => {
  return (replyContent.value?.text?.trim() !== '' || selectedFiles.value.length > 0) && !sendingReply.value
})

// 文件处理相关方法
const openFileSelector = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) fileInput.click()
}

const handleFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(input.files)]
    // 清空input，以便可以选择相同的文件
    input.value = ''
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

// 获取文件图标
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('image')) return 'mdi-file-image'
  if (mimeType.includes('pdf')) return 'mdi-file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'mdi-file-word'
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'mdi-file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'mdi-file-powerpoint'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'mdi-file-archive'
  if (mimeType.includes('audio')) return 'mdi-file-music'
  if (mimeType.includes('video')) return 'mdi-file-video'
  if (mimeType.includes('text')) return 'mdi-file-document'
  return 'mdi-file'
}

// 添加处理回复的回复
const handleReplyToReply = ({ parentDiscussion, reply }: { parentDiscussion: any; reply: any }) => {
  replyingTo.value = reply
  // 聚焦到输入框
  setTimeout(() => {
    const textarea = document.querySelector('.detail-reply-textarea') as HTMLElement
    if (textarea) textarea.focus()
  }, 100)
}

// 添加处理删除回复
const handleDeleteReply = async ({ parentDiscussion, reply }: { parentDiscussion: any; reply: any }) => {
  const result = await dialog
    .confirm('确定要删除这条回复吗？此操作不可撤销。', {
      title: '删除回复',
    })
    .wait()

  if (result && currentMessage.value && currentMessage.value.subDiscussions) {
    try {
      await discussionStore.deleteDiscussion(reply.id)
      // 删除成功后更新当前回复列表
      currentMessage.value.subDiscussions.examples = currentMessage.value.subDiscussions.examples.filter(
        (r) => r.id !== reply.id
      )
      dialog.alert('回复已删除', { title: '成功' })
    } catch (error) {
      console.error('删除回复失败', error)
      dialog.alert('删除回复失败，请重试', { title: '错误' })
    }
  }
}

// 删除讨论的方法
const deleteMessage = async () => {
  if (!currentMessage.value) return

  try {
    const result = await dialog
      .confirm('确定要删除这条讨论吗？所有回复也将被删除。此操作无法撤销。', {
        title: '确认删除',
      })
      .wait()

    if (result) {
      await discussionStore.deleteDiscussion(currentMessage.value.id)
      // 删除成功后返回上一页
      goBack()
      dialog.alert('讨论已删除', { title: '成功' })
    }
  } catch (error) {
    console.error('删除讨论失败', error)
    dialog.alert('删除讨论失败，请重试', { title: '错误' })
  }
}

// 监听路由参数变化，重新加载数据
watch(
  () => route.params.discussionId,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      discussionStore.loadDiscussion(Number(newVal))
      // 重置分页状态
      currentPage.value = 1
      hasMoreReplies.value = false
    }
  }
)

interface DiscussionData {
  currentMessage: ComputedRef<Discussion | null>
  isCurrentUserMessage: ComputedRef<boolean>
  channelName: ComputedRef<string>
  goBack: () => void
}

// 注入共享数据
const discussionData = inject<DiscussionData>('discussionData', {
  currentMessage: computed(() => null),
  isCurrentUserMessage: computed(() => false),
  channelName: computed(() => '讨论详情'),
  goBack: () => {},
})

// 页面加载时获取数据
onMounted(async () => {
  await discussionStore.loadReactionTypes()
  await discussionStore.loadDiscussion(discussionId.value, {
    page_size: pageSize.value,
    sort_order: 'asc',
  })

  // 根据初始加载的回复数量，判断是否可能有更多回复
  if (currentMessage.value?.subDiscussions) {
    hasMoreReplies.value =
      currentMessage.value.subDiscussions.count > currentMessage.value.subDiscussions.examples.length
  }
})

// 离开组件时清除当前讨论
onUnmounted(() => {
  discussionStore.clearCurrentDiscussion()
})
</script>

<style lang="scss" scoped>
.discussion-detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.discussion-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: white;
  z-index: 10;
}

.message-area {
  overflow-y: auto;
  padding-bottom: 12px;
  flex-grow: 1;
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.error-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.empty-state {
  border: 1px dashed rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.01);
  margin: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.message-item {
  transition: background-color 0.2s ease;
  margin-bottom: 4px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

.message-content {
  width: 100%;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.border-l {
  border-left: 2px solid rgba(0, 0, 0, 0.06);
}

.reply-counter {
  color: rgba(0, 0, 0, 0.7);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.replies-container {
  margin-top: 0.5rem;
}

.reply-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

.reply-text {
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-content {
  width: 100%;
}

.reply-reference {
  color: rgba(var(--v-theme-primary), 0.8);
  margin-right: 0.5rem;
}

.reply-actions {
  opacity: 0;
  transition: opacity 0.2s ease;

  .action-btn {
    font-size: 0.7rem;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }
}

.reply-item:hover .reply-actions {
  opacity: 1;
}

.message-reactions {
  padding: 2px 0;
}

.reaction-chip {
  transition: all 0.2s ease;
  font-size: 12px;
  min-width: 42px;

  &:hover {
    transform: scale(1.05);
  }
}

.reaction-count {
  font-size: 10px;
  font-weight: 500;
}

.add-reaction-btn {
  opacity: 0.6;
  transition: all 0.2s ease;
  margin-left: 4px;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.emoji-btn {
  min-width: 40px;
  height: 40px;
  font-size: 18px;
  transition: all 0.15s ease;

  &:hover {
    transform: scale(1.2);
    background-color: transparent;
  }
}

.action-btn {
  opacity: 0.75;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
}

.message-input-container {
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.editor-container {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 8px;
  transition: all 0.2s ease;
  margin-bottom: 4px;

  &.is-active {
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
}

.detail-reply-textarea {
  padding: 0;

  :deep(.v-field__field) {
    min-height: auto;
  }
}

.attachment-card {
  max-width: 500px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(2px);
  }
}

.selected-files {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 8px;
}

.reply-context {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border-left: 3px solid rgba(var(--v-theme-primary), 0.5);
}

.reply-preview {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(0, 0, 0, 0.6);
}

.no-replies-container {
  background-color: rgba(0, 0, 0, 0.01);
  border-radius: 8px;
  border: 1px dashed rgba(0, 0, 0, 0.06);
}

// 添加按钮悬停效果
.v-btn {
  transition: all 0.2s ease;

  &:not(.v-btn--icon):hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 1264px) {
  .attachment-card {
    max-width: 95%;
  }
}

@media (max-width: 960px) {
  .message-area {
    max-height: calc(100vh - 300px);
  }
}

@media (max-width: 600px) {
  .message-item,
  .reply-item {
    padding: 0.75rem;
  }

  .reply-actions {
    opacity: 1;
  }

  .discussion-header h2 {
    font-size: 1rem;
  }
}
</style>
