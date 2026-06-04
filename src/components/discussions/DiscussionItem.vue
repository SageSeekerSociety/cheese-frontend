<template>
  <div class="discussion-item">
    <!-- 主消息 -->
    <div class="message-container pa-2 rounded-lg">
      <div class="d-flex">
        <v-avatar size="40" color="grey-lighten-2" class="mt-1 flex-shrink-0">
          <v-img :src="getAvatarUrl(discussion.sender.avatarId)" />
        </v-avatar>

        <div class="ml-3 message-content">
          <div class="d-flex align-center">
            <span class="font-weight-medium">{{ discussion.sender.nickname }}</span>
            <span class="text-caption text-medium-emphasis ml-2">
              {{ formatMessageTime(discussion.createdAt) }}
            </span>
          </div>

          <div class="mt-1 message-text">
            <TipTapViewer v-if="isJsonContent" :value="JSON.parse(discussion.content)" />
            <p v-else class="text-body-1">{{ discussion.content }}</p>
          </div>

          <!-- 附件展示 -->
          <div v-if="discussion.attachments && discussion.attachments.length > 0" class="mt-2">
            <div v-for="attachment in discussion.attachments" :key="attachment.id" class="attachment-card mt-2">
              <v-card elevation="0" variant="tonal" rounded="lg" class="pa-3">
                <div class="d-flex align-center">
                  <v-icon size="24" :icon="getFileIcon(attachment.type)" class="mr-2"></v-icon>
                  <div>
                    <div class="text-body-2">{{ attachment.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ formatFileSize(attachment.size) }}</div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-download" variant="text" size="small" @click="downloadFile(attachment)"></v-btn>
                </div>
              </v-card>
            </div>
          </div>

          <!-- 链接预览 -->
          <div v-if="discussion.links && discussion.links.length > 0" class="mt-2">
            <div v-for="link in discussion.links" :key="link.url" class="link-preview-card mt-2">
              <v-card elevation="1" rounded="lg" class="overflow-hidden">
                <div class="d-flex">
                  <div v-if="link.image" class="link-image" :style="{ backgroundImage: `url(${link.image})` }"></div>
                  <div class="pa-3">
                    <div class="text-body-2 font-weight-medium">{{ link.title || link.url }}</div>
                    <div v-if="link.description" class="text-caption text-medium-emphasis mt-1 link-description">
                      {{ link.description }}
                    </div>
                    <div class="text-caption mt-1">
                      <a :href="link.url" target="_blank" class="text-decoration-none">{{ getDomain(link.url) }}</a>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </div>

          <!-- 反应和操作 -->
          <div class="message-reactions mt-2">
            <!-- 反应按钮 -->
            <div class="d-flex align-center flex-wrap reaction-buttons">
              <v-chip
                v-for="reaction in currentReactions"
                :key="reaction.reactionType.id"
                :color="reaction.hasReacted ? 'primary' : undefined"
                :variant="reaction.hasReacted ? 'flat' : 'tonal'"
                size="x-small"
                class="mr-2 reaction-chip"
                @click="toggleReaction(reaction.reactionType.id)"
              >
                {{ reaction.reactionType.code }}
                <span class="reaction-count ml-1">
                  {{ reaction.count }}
                </span>
              </v-chip>

              <v-menu v-model="showEmojiMenu" :close-on-content-click="false" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="tonal"
                    size="x-small"
                    rounded="pill"
                    color="grey-darken-1"
                    class="add-reaction-btn"
                  >
                    <v-icon>mdi-emoticon-outline</v-icon>
                  </v-btn>
                </template>
                <v-card class="emoji-selector" elevation="3" rounded="lg">
                  <div class="d-flex flex-wrap">
                    <v-btn
                      v-for="reactionType in reactionTypes"
                      :key="reactionType.id"
                      variant="text"
                      size="x-small"
                      class="emoji-btn"
                      @click="
                        () => {
                          toggleReaction(reactionType.id)
                          showEmojiMenu = false
                        }
                      "
                    >
                      {{ reactionType.code }}
                    </v-btn>
                  </div>
                </v-card>
              </v-menu>

              <!-- 操作按钮 -->
              <div class="d-flex">
                <v-btn
                  variant="text"
                  size="x-small"
                  color="grey-darken-1"
                  class="action-btn ml-4"
                  rounded="pill"
                  @click="$emit('reply', discussion)"
                >
                  <v-icon size="14" start>mdi-reply</v-icon> 回复
                </v-btn>

                <v-btn
                  v-if="isCurrentUserOwner"
                  variant="text"
                  size="x-small"
                  color="grey-darken-1"
                  class="action-btn ml-2"
                  rounded="pill"
                  @click="$emit('delete', discussion)"
                >
                  <v-icon size="14" start>mdi-delete-outline</v-icon> 删除
                </v-btn>
              </div>
            </div>

            <!-- 附加操作按钮 -->
            <div v-if="showExtendedActions" class="d-flex align-center mt-2">
              <v-spacer></v-spacer>

              <v-btn
                v-if="canAddToKnowledge"
                variant="text"
                size="x-small"
                color="primary"
                class="action-btn knowledge-btn"
                @click="$emit('add-to-knowledge', discussion)"
              >
                <v-icon size="14" class="mr-1">mdi-bookmark-outline</v-icon>
                添加到知识库
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscussionWithUI, ReactionType } from '@/types'

import { computed, ref } from 'vue'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import TipTapViewer from '@/components/common/Editor/TipTapViewer.vue'
import { currentUserId } from '@/services/account'

const props = defineProps<{
  discussion: DiscussionWithUI
  showExtendedActions?: boolean
  canAddToKnowledge?: boolean
  reactionTypes: ReactionType[]
}>()

const emit = defineEmits<{
  (e: 'reply', discussion: DiscussionWithUI): void
  (e: 'delete', discussion: DiscussionWithUI): void
  (e: 'add-to-knowledge', discussion: DiscussionWithUI): void
  (e: 'toggle-reaction', discussionId: number, reactionTypeId: number): void
}>()

const currentReactions = computed(() => {
  return [...(props.discussion.reactions || [])].sort((a, b) => b.count - a.count).filter((r) => r.count > 0)
})

const showEmojiMenu = ref(false)

const isCurrentUserOwner = computed(() => {
  return props.discussion.sender.id === currentUserId.value
})

const isJsonContent = computed(() => {
  try {
    if (typeof props.discussion.content === 'string') {
      JSON.parse(props.discussion.content)
      return true
    }
    return false
  } catch (e) {
    return false
  }
})

// 切换反应
const toggleReaction = (reactionTypeId: number) => {
  emit('toggle-reaction', props.discussion.id, reactionTypeId)
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

// 获取链接域名
const getDomain = (url: string) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}
</script>

<style lang="scss" scoped>
.discussion-item {
  margin-bottom: 0.5rem;
}

.message-container {
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

.attachment-card {
  max-width: 500px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(2px);
  }
}

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
</style>
