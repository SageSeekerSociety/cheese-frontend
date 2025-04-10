<template>
  <div class="channel-view d-flex flex-column">
    <!-- 频道内容区 -->
    <div v-if="loading" class="loading-container py-8 flex-grow-1">
      <v-progress-circular indeterminate color="primary" class="mx-auto d-block"></v-progress-circular>
    </div>

    <div v-else-if="!currentChannel" class="text-center py-12 flex-grow-1">
      <v-icon icon="mdi-forum-outline" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
      <h3 class="text-h6 font-weight-medium mb-2">请选择一个频道</h3>
      <p class="text-body-2 text-medium-emphasis mb-6">在左侧选择一个频道开始交流，或创建新频道</p>
      <v-btn v-if="isTeamAdmin" color="primary" prepend-icon="mdi-plus" @click="openCreateChannelDialog">
        创建频道
      </v-btn>
    </div>

    <template v-else>
      <!-- 消息流区域 -->
      <div class="message-area flex-grow-1 px-4 pt-3">
        <div v-if="messages.length === 0" class="empty-channel-state text-center py-8">
          <v-icon icon="mdi-message-text-outline" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">频道开始</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">这是频道的开始，发送第一条消息开始交流吧</p>
          <p class="text-caption text-medium-emphasis">
            {{ formatDate(currentChannel.createdAt) }} 由 {{ getCreatorName() }} 创建
          </p>
        </div>

        <div v-else class="messages-list">
          <!-- 原始消息项 -->
          <div v-for="message in messages" :key="message.id" class="message-thread mb-2">
            <!-- 主消息 -->
            <DiscussionItem
              :discussion="message"
              :reaction-types="discussionStore.reactionTypes"
              :show-extended-actions="false"
              :can-add-to-knowledge="canAddToKnowledge(message)"
              @reply="replyToMessage"
              @delete="deleteMessage"
              @add-to-knowledge="addToKnowledge"
              @toggle-reaction="(discussionId, reactionTypeId) => toggleReaction(discussionId, reactionTypeId)"
            />

            <!-- 回复列表 -->
            <ReplyList
              v-if="message.subDiscussions && message.subDiscussions.count > 0"
              :discussion-id="message.id"
              :parent-discussion="message"
              :replies="message.subDiscussions.examples"
              :expanded="expandedMessages.includes(message.id)"
              @view-all-replies="navigateToMessageDetails"
              @reply-to-reply="handleReplyToReply"
              @delete-reply="handleDeleteReply"
              @collapse="collapseMessage(message.id)"
            />
          </div>
        </div>
      </div>

      <!-- 消息输入区 -->
      <div v-if="!currentChannel.archived" class="message-input-container px-4 pb-4">
        <!-- 显示回复上下文 -->
        <div v-if="replyingToMessage" class="reply-context pa-2 mb-2 d-flex align-center">
          <div class="flex-grow-1 d-flex align-center">
            <v-icon class="mr-2 text-medium-emphasis" size="small">mdi-reply</v-icon>
            <span class="text-caption text-medium-emphasis">
              回复给 <strong>{{ replyingToMessage.sender.nickname }}</strong>
              <span v-if="replyingToReply">
                关于 <strong>@{{ replyingToReply.sender.nickname }}</strong> 的回复
              </span>
            </span>
            <div class="reply-preview text-caption text-truncate ml-2 px-2 py-1">
              {{ getReplyPreviewText() }}
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" size="small" @click="cancelReply"></v-btn>
        </div>

        <div class="editor-container" :class="{ 'is-active': isInputActive }">
          <TipTapEditor
            ref="editorRef"
            v-model="newMessage"
            :hide-toolbar="true"
            :min-height="36"
            :max-height="150"
            output="json"
            :disabled="isSending"
            :dense="true"
            @focus="isInputActive = true"
            @blur="isInputActive = false"
            @keydown.enter.ctrl.stop.prevent="handleSend"
          >
            <template #bottom><div></div></template>
          </TipTapEditor>
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
            @click:close="removeSelectedFile(index)"
          >
            <v-icon start size="small">{{ getFileIcon(file.type) }}</v-icon>
            {{ file.name }}
          </v-chip>
        </div>

        <div class="d-flex justify-end align-center ga-4 px-2 pt-2">
          <span class="text-caption text-medium-emphasis">Ctrl+Enter 发送</span>
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            :loading="isSending"
            :disabled="!canSendMessage"
            @click="handleSend"
          >
            {{ replyingToMessage ? '回复' : '发送' }}
            <v-icon end>{{ replyingToMessage ? 'mdi-reply' : 'mdi-send' }}</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-else class="archived-notice px-4 py-3">
        <v-alert type="info" variant="tonal" class="text-center"> 该频道已归档，无法发送新消息 </v-alert>
      </div>
    </template>

    <!-- 创建频道对话框 -->
    <project-form-dialog
      v-model="createChannelDialog"
      :initial-data="editingChannel"
      :is-editing="!!editingChannel"
      :team-members="teamMembers"
      :team-id="teamId"
      :loading="saving"
      @submit="saveChannel"
    />
  </div>
</template>

<script setup lang="ts">
import type { Project, User } from '@/types'
import type { CreateKnowledgeRequest, KnowledgeType } from '@/types'

import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { JSONContent } from 'vuetify-pro-tiptap'
import { toast } from 'vuetify-sonner'
import dayjs from 'dayjs'

import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import DiscussionItem from '@/components/discussions/DiscussionItem.vue'
import ReplyList from '@/components/discussions/ReplyList.vue'
import ProjectFormDialog from '@/components/projects/forms/ProjectFormDialog.vue'
import { teamDataInjectionKey } from '@/keys'
import { KnowledgesApi } from '@/network/api/knowledges'
import { ProjectsApi } from '@/network/api/projects'
import { TeamsApi } from '@/network/api/teams'
import { useDialog } from '@/plugins/dialog'
import { currentUserId } from '@/services/account'
import { useDiscussionStore } from '@/stores/discussionStore'

const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const teamId = computed(() => Number(route.params.teamId))
const discussionStore = useDiscussionStore()
const editorRef = ref<InstanceType<typeof TipTapEditor> | null>(null)
// 频道相关状态
const loading = ref(true)
const isSending = ref(false)
const currentChannel = ref<Project | null>(null)
const teamMembers = ref<User[]>([])

// 消息相关状态 - 使用 store 中的讨论
const messages = computed(() => {
  if (!currentChannel.value) return []
  return discussionStore.discussionsByChannel[String(currentChannel.value.id)] || []
})

const newMessage = ref<JSONContent | null>(null)
const selectedFiles = ref<File[]>([])
const replyingToMessage = ref<any | null>(null)
const replyingToReply = ref<any | null>(null)
const expandedMessages = ref<number[]>([]) // 已展开的消息ID列表

// 创建/编辑频道状态
const createChannelDialog = ref(false)
const editingChannel = ref<Project | null>(null)
const saving = ref(false)

const teamData = inject(teamDataInjectionKey, ref())

const isTeamAdmin = computed(() => {
  // 判断当前用户是否为管理员或创建者
  if (!teamData.value || !currentUserId.value) return false

  if (teamData.value.owner.id === currentUserId.value) {
    return true
  }

  return teamData.value.admins.examples?.some((admin) => admin.id === currentUserId.value) || false
})

const canSendMessage = computed(() => {
  return (!editorRef.value?.isEmpty || selectedFiles.value.length > 0) && !isSending.value
})

const isInputActive = ref(false)

// 获取当前频道详情
const fetchCurrentChannel = async (channelId: number) => {
  try {
    loading.value = true
    const response = await ProjectsApi.detail(channelId)
    currentChannel.value = {
      ...response.data.project,
      archived: response.data.project.archived || false, // 确保有archived字段
    }
  } catch (error) {
    console.error('获取频道详情失败', error)
    currentChannel.value = null
  } finally {
    loading.value = false
  }
}

// 获取频道消息列表 - 使用 store
const fetchMessages = async (channelId: number) => {
  try {
    await discussionStore.loadDiscussionsByChannel(channelId)
  } catch (error) {
    console.error('获取消息失败', error)
  }
}

// 获取小队成员列表
const fetchTeamMembers = async () => {
  try {
    const response = await TeamsApi.getMembers(teamId.value)
    teamMembers.value = response.data.members.map((member) => member.user)
  } catch (error) {
    console.error('获取小队成员失败', error)
  }
}

// 打开创建频道对话框
const openCreateChannelDialog = () => {
  editingChannel.value = null
  createChannelDialog.value = true
}

// 保存频道
const saveChannel = async (formData: any) => {
  if (!currentUserId.value) return

  try {
    saving.value = true

    if (editingChannel.value) {
      await ProjectsApi.update(editingChannel.value.id, formData)
    } else {
      const response = await ProjectsApi.create({
        ...formData,
        leaderId: formData.leaderId || currentUserId.value,
      })

      // 创建成功后导航到新频道
      if (response.data.project) {
        router.replace({
          ...route,
          query: { ...route.query, channelId: String(response.data.project.id) },
        })
      }
    }

    createChannelDialog.value = false
  } catch (error) {
    console.error('保存频道失败', error)
  } finally {
    saving.value = false
  }
}

// 移除已选文件
const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

// 导航到消息详情页 - 使用 store
const navigateToMessageDetails = (messageId: number) => {
  if (!currentChannel.value) return

  // 导航到消息详情页面并附带频道信息
  router.push({
    name: 'TeamsDetailDiscussion',
    params: {
      teamId: teamId.value,
      discussionId: messageId,
    },
    query: {
      channelId: String(currentChannel.value.id),
      channelName: currentChannel.value.name,
    },
  })

  // 提前加载讨论以提高用户体验
  discussionStore.loadDiscussion(messageId)
}

// 获取回复预览文本
const getReplyPreviewText = () => {
  if (!replyingToMessage.value) return ''

  if (replyingToReply.value) {
    // 回复的是回复
    return replyingToReply.value.content.substring(0, 50) + (replyingToReply.value.content.length > 50 ? '...' : '')
  } else {
    // 回复的是主消息
    return replyingToMessage.value.content.substring(0, 50) + (replyingToMessage.value.content.length > 50 ? '...' : '')
  }
}

// 统一处理发送消息和回复
const handleSend = () => {
  if (replyingToMessage.value) {
    sendReply()
  } else {
    sendMessage()
  }
}

// 发送消息 - 使用 store
const sendMessage = async () => {
  if (!canSendMessage.value || !currentChannel.value) return

  try {
    isSending.value = true

    // 使用 store 发送讨论
    await discussionStore.createDiscussion(newMessage.value as JSONContent, currentChannel.value.id)

    // 清空输入
    newMessage.value = null
    selectedFiles.value = []
    replyingToMessage.value = null
    replyingToReply.value = null

    // 滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败', error)
  } finally {
    isSending.value = false
  }
}

// 回复消息 - 修改为设置回复状态而不是显示输入框
const replyToMessage = (message: any) => {
  replyingToMessage.value = message
  replyingToReply.value = null
  newMessage.value = null

  // 聚焦到主输入框
  focusMainInput()
}

// 聚焦到主输入框
const focusMainInput = () => {
  setTimeout(() => {
    const editor = document.querySelector('.editor-container .ProseMirror')
    if (editor) {
      ;(editor as HTMLElement).focus()
    }
  }, 100)
}

// 取消回复
const cancelReply = () => {
  replyingToMessage.value = null
  replyingToReply.value = null
}

// 发送回复 - 使用 store
const sendReply = async () => {
  if (!newMessage.value || !replyingToMessage.value || isSending.value || !currentChannel.value) return

  try {
    isSending.value = true

    // 使用 store 发送回复
    const reply = await discussionStore.replyToDiscussion(
      replyingToMessage.value.id,
      newMessage.value as JSONContent,
      currentChannel.value.id
    )

    // 更新父消息的子讨论列表
    const parentMessage = messages.value.find((m) => m.id === replyingToMessage.value.id)
    if (parentMessage) {
      if (!parentMessage.subDiscussions) {
        parentMessage.subDiscussions = {
          count: 1,
          examples: [reply],
        }
      } else {
        parentMessage.subDiscussions.examples.push(reply)
        parentMessage.subDiscussions.count += 1
      }
    }

    // 清空输入和状态
    newMessage.value = null
    selectedFiles.value = []
    replyingToMessage.value = null
    replyingToReply.value = null

    // 滚动到新回复位置
    scrollToBottom()
  } catch (error) {
    console.error('发送回复失败', error)
  } finally {
    isSending.value = false
  }
}

// 删除消息
const deleteMessage = async (message: any) => {
  const result = await dialog
    .confirm('确定要删除这条消息吗？此操作不可撤销。', {
      title: '删除消息',
    })
    .wait()

  if (result) {
    if (currentChannel.value) {
      try {
        await discussionStore.deleteDiscussion(message.id)
      } catch (error) {
        toast.error(`删除消息失败: ${error}`)
      }
    }
  }
}

// 更新添加到知识库方法
const addToKnowledge = async (message: any) => {
  try {
    const knowledgeData: CreateKnowledgeRequest = {
      name: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
      description: message.content,
      type: 'TEXT',
      content: message.content,
      teamId: teamId.value,
      discussionId: message.id,
    }

    // 如果有链接，设置为链接类型
    if (message.links && message.links.length > 0) {
      knowledgeData.type = 'LINK'
      knowledgeData.content = message.links[0].url

      // 使用链接标题作为知识条目名称
      if (message.links[0].title) {
        knowledgeData.name = message.links[0].title
      }

      // 使用链接描述作为知识条目描述
      if (message.links[0].description) {
        knowledgeData.description = message.links[0].description
      }
    }

    // 如果有图片附件，设置为图片类型
    else if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0]
      if (
        attachment.type.startsWith('image/') ||
        attachment.type.startsWith('video/') ||
        attachment.type.startsWith('audio/')
      ) {
        knowledgeData.type = 'MATERIAL'
      }

      // 使用附件名称作为知识条目名称
      if (attachment.name) {
        knowledgeData.name = attachment.name
      }

      // 设置materialId
      if (attachment.id) {
        knowledgeData.materialId = attachment.id
      }
    }

    // 设置频道信息
    if (currentChannel.value) {
      knowledgeData.projectId = currentChannel.value.id
    }

    // 创建知识条目
    await KnowledgesApi.create(knowledgeData)

    toast.success('消息已添加到知识库')
  } catch (error) {
    console.error('添加到知识库失败', error)
    toast.error('添加到知识库失败，请稍后重试')
  }
}

// 判断消息是否可以添加到知识库
const canAddToKnowledge = (message: any) => {
  // 例如，只有包含链接或附件的消息才能添加到知识库
  return (
    (message.attachments && message.attachments.length > 0) ||
    (message.links && message.links.length > 0) ||
    message.content.length > 30
  )
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

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    const container = document.querySelector('.message-area')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, 100)
}

// 获取创建者名称
const getCreatorName = () => {
  if (!currentChannel.value || !currentChannel.value.leader) return '未知用户'
  return currentChannel.value.leader.nickname
}

// 格式化日期
const formatDate = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY年MM月DD日')
}

// 切换反应状态
const toggleReaction = (messageId: number, reactionTypeId: number) => {
  discussionStore.toggleReaction(messageId, reactionTypeId)
}

// 获取当前频道
watch(
  () => route.params.channelId,
  async (newChannelId) => {
    if (newChannelId) {
      await fetchCurrentChannel(Number(newChannelId))
      await fetchMessages(Number(newChannelId))
    } else {
      currentChannel.value = null
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await discussionStore.loadReactionTypes()
  await fetchTeamMembers()

  // 路由参数的监听已经处理了频道和讨论的加载
  // 只处理没有频道ID的情况
  if (!route.params.channelId) {
    currentChannel.value = null
    loading.value = false
  }
})

// 收起消息的回复
const collapseMessage = (messageId: number) => {
  expandedMessages.value = expandedMessages.value.filter((id) => id !== messageId)
}

// 添加处理回复的回复
const handleReplyToReply = ({ parentDiscussion, reply }: { parentDiscussion: any; reply: any }) => {
  replyingToMessage.value = parentDiscussion
  replyingToReply.value = reply

  // 聚焦到输入框
  setTimeout(() => {
    const editor = document.querySelector('.editor-container .ProseMirror')
    if (editor) {
      ;(editor as HTMLElement).focus()
    }
  }, 100)
}

// 添加处理删除回复
const handleDeleteReply = async ({ parentDiscussion, reply }: { parentDiscussion: any; reply: any }) => {
  const result = await dialog
    .confirm('确定要删除这条回复吗？此操作不可撤销。', {
      title: '删除回复',
    })
    .wait()

  if (result && parentDiscussion.replies) {
    // TODO: 实现删除回复的API调用
    // 目前先模拟删除
    parentDiscussion.replies = parentDiscussion.replies.filter((r: any) => r.id !== reply.id)
  }
}
</script>

<style scoped lang="scss">
.channel-view {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-area {
  overflow-y: auto;
  padding-bottom: 12px;
  margin-bottom: 0;
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

.message-input-container {
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.message-input-area {
  background-color: var(--v-theme-surface);
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;

  &.active-input {
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
}

.editor-container {
  border-radius: 8px;

  &.is-active {
    background-color: rgba(0, 0, 0, 0.01);
  }

  :deep(.tiptap-editor) {
    padding: 8px;
    border: none;
    min-height: 36px;
    max-height: 150px;

    .ProseMirror {
      box-shadow: none;
      min-height: 36px;
      padding: 4px 8px;

      &:focus {
        outline: none;
      }

      p.is-editor-empty:first-child::before {
        content: '发送消息...';
        float: left;
        color: rgba(0, 0, 0, 0.38);
        pointer-events: none;
        height: 0;
      }
    }
  }
}

.attachment-card,
.link-preview-card {
  max-width: 500px;
}

.link-image {
  width: 80px;
  height: 80px;
  background-size: cover;
  background-position: center;
  border-right: 1px solid rgba(0, 0, 0, 0.03);
}

.link-description {
  max-height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-channel-state {
  border: 1px dashed rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.01);
}

// 响应式调整
@media (max-width: 960px) {
  .message-area {
    max-height: calc(100vh - 300px);
  }
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

.knowledge-btn {
  opacity: 0.85;

  &:hover {
    opacity: 1;
  }
}

.border-l {
  border-left: 2px solid rgba(0, 0, 0, 0.06);
}

.replies-container {
  margin-top: 0.5rem;
}

.collapsed-replies-info {
  margin-bottom: 0.5rem;
}

.view-all-replies {
  font-size: 0.8rem;
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
</style>
