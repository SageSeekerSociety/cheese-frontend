<template>
  <div class="ml-6 pl-6 border-l">
    <!-- 显示折叠提示 -->
    <div
      v-if="
        showCollapseHint &&
        parentDiscussion.subDiscussions &&
        parentDiscussion.subDiscussions.count > displayedReplies.length
      "
      class="collapsed-replies-info py-1 px-2"
    >
      <v-btn
        variant="text"
        size="small"
        color="primary"
        prepend-icon="mdi-comment-multiple-outline"
        class="view-all-replies"
        @click="$emit('view-all-replies', discussionId)"
      >
        查看全部 {{ parentDiscussion.subDiscussions?.count || replies.length }} 条回复
      </v-btn>
    </div>

    <!-- 回复列表 -->
    <div v-if="showHeader" class="reply-counter">
      <div class="text-subtitle-1 font-weight-medium mb-2 pb-2 border-bottom">
        {{ parentDiscussion.subDiscussions?.count || replies.length || 0 }} 条回复
      </div>
    </div>

    <!-- 回复内容 -->
    <div v-for="reply in displayedReplies" :key="reply.id" class="reply-item pa-2 rounded-lg">
      <div class="d-flex">
        <v-avatar size="32" color="grey-lighten-2" class="mt-1 flex-shrink-0">
          <v-img :src="getAvatarUrl(reply.sender.avatarId)" />
        </v-avatar>

        <div class="ml-3 reply-content">
          <div class="d-flex align-center">
            <span class="font-weight-medium">{{ reply.sender.nickname }}</span>
            <span class="text-caption text-medium-emphasis ml-2">{{ formatMessageTime(reply.createdAt) }}</span>
          </div>

          <div class="mt-1 reply-text">
            <p class="text-body-2">
              <span v-if="reply.replyTo" class="reply-reference text-caption">
                回复 <strong>@{{ getReplyToName(reply) }}</strong
                >:
              </span>
              <TipTapViewer v-if="isJsonContent(reply)" :value="JSON.parse(reply.content)" />
              <span v-else>{{ reply.content }}</span>
            </p>
          </div>

          <!-- 回复的附件 -->
          <div v-if="reply.attachments && reply.attachments.length > 0" class="mt-2">
            <div v-for="attachment in reply.attachments" :key="attachment.id" class="attachment-card mt-2">
              <v-card elevation="0" variant="tonal" rounded="lg" class="pa-2">
                <div class="d-flex align-center">
                  <v-icon size="20" :icon="getFileIcon(attachment.type)" class="mr-2"></v-icon>
                  <div>
                    <div class="text-caption">{{ attachment.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ formatFileSize(attachment.size) }}</div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-download" variant="text" size="x-small" @click="downloadFile(attachment)"></v-btn>
                </div>
              </v-card>
            </div>
          </div>

          <!-- 回复的操作 -->
          <div class="reply-actions mt-1">
            <div class="d-flex align-center">
              <v-btn
                variant="text"
                size="x-small"
                color="grey-darken-1"
                class="action-btn mr-2"
                @click="$emit('reply-to-reply', { parentDiscussion, reply })"
              >
                <v-icon size="12" class="mr-1">mdi-reply</v-icon> 回复
              </v-btn>

              <v-btn
                v-if="isCurrentUserReply(reply)"
                variant="text"
                size="x-small"
                color="grey-darken-1"
                class="action-btn"
                @click="$emit('delete-reply', { parentDiscussion, reply })"
              >
                <v-icon size="12" class="mr-1">mdi-delete-outline</v-icon> 删除
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看所有回复或收起 -->
    <div v-if="canToggleExpand && expanded" class="text-center my-2">
      <v-btn variant="text" size="small" color="grey" class="collapse-replies" @click="$emit('collapse')">
        收起回复
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscussionWithUI } from '@/types'

import { computed } from 'vue'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import TipTapViewer from '@/components/common/Editor/TipTapViewer.vue'
import { currentUserId } from '@/services/account'

const props = defineProps<{
  discussionId: number
  parentDiscussion: DiscussionWithUI
  replies: DiscussionWithUI[]
  expanded?: boolean
  maxVisibleReplies?: number
  showHeader?: boolean
}>()

const emit = defineEmits<{
  (e: 'view-all-replies', discussionId: number): void
  (e: 'reply-to-reply', data: { parentDiscussion: DiscussionWithUI; reply: DiscussionWithUI }): void
  (e: 'delete-reply', data: { parentDiscussion: DiscussionWithUI; reply: DiscussionWithUI }): void
  (e: 'collapse'): void
}>()

// 配置最大显示回复数
const maxReplies = computed(() => props.maxVisibleReplies || 2)

// 控制是否展示折叠提示
const showCollapseHint = computed(() => {
  // 如果父讨论有子讨论计数且大于当前显示的回复数，显示折叠提示
  if (props.parentDiscussion.subDiscussions?.count) {
    return props.parentDiscussion.subDiscussions.count > props.replies.length && !props.expanded
  }
  // 否则使用原有逻辑
  return props.replies.length > maxReplies.value && !props.expanded
})

// 要显示的回复
const displayedReplies = computed(() => {
  if (props.expanded || props.replies.length <= maxReplies.value) {
    return props.replies
  }
  // 只显示最新的N条回复
  return props.replies.slice(-maxReplies.value)
})

// 是否可以展开/折叠
const canToggleExpand = computed(() => {
  return props.replies.length > maxReplies.value
})

// 检查回复是否为当前用户的回复
const isCurrentUserReply = (reply: DiscussionWithUI) => {
  return reply.sender.id === currentUserId.value
}

// 检查是否为JSON内容
const isJsonContent = (reply: DiscussionWithUI) => {
  try {
    if (typeof reply.content === 'string') {
      JSON.parse(reply.content)
      return true
    }
    return false
  } catch (e) {
    return false
  }
}

// 获取回复对象名称
const getReplyToName = (reply: DiscussionWithUI) => {
  if (!reply.replyTo) return ''
  // 如果回复的是另一个回复，找到被回复的回复作者
  return reply.replyTo.nickname || '未知用户'
}

// 格式化消息时间
const formatMessageTime = (timestamp: number) => {
  const now = dayjs()
  const messageTime = dayjs(timestamp)

  if (now.diff(messageTime, 'day') === 0) {
    // 今天
    return messageTime.format('HH:mm')
  } else if (now.diff(messageTime, 'day') === 1) {
    // 昨天
    return `昨天 ${messageTime.format('HH:mm')}`
  } else if (now.diff(messageTime, 'day') < 7) {
    // 本周
    return messageTime.format('ddd HH:mm')
  } else {
    // 更久以前
    return messageTime.format('MM-DD HH:mm')
  }
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

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}

// 下载文件
const downloadFile = (attachment: any) => {
  // 创建一个下载链接并点击它
  const a = document.createElement('a')
  a.href = attachment.url
  a.download = attachment.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<style lang="scss" scoped>
.reply-counter {
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 0.5rem;
}

.border-l {
  border-left: 2px solid rgba(0, 0, 0, 0.06);
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.reply-item {
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

.collapsed-replies-info {
  margin-bottom: 0.5rem;
}

.view-all-replies {
  font-size: 0.8rem;
}

.attachment-card {
  max-width: 450px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(2px);
  }
}

@media (max-width: 960px) {
  .reply-actions {
    opacity: 1;
  }
}
</style>
