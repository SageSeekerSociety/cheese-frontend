<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h5">{{ t('spaces.discussions.title') }}</h1>
          <v-btn color="primary" rounded="pill" @click="navigateToCreateDiscussion">
            <v-icon start>mdi-plus-circle-outline</v-icon>
            {{ t('spaces.discussions.newDiscussion') }}
          </v-btn>
        </div>

        <InfiniteScroll
          :loading="isLoadingMore"
          :has-more="pageInfo.hasMore"
          :initial-loading="isInitialLoading"
          :is-empty="!isInitialLoading && discussions.length === 0"
          class="discussions-scroll-container"
          @load-more="loadMoreDiscussions"
        >
          <wc-waterfall
            v-if="!isInitialLoading && discussions.length > 0"
            :cols="cols"
            :gap="12"
            class="discussions-waterfall"
          >
            <div
              v-for="discussion in discussions"
              :key="discussion.id"
              class="xiaohongshu-card"
              @click="navigateToDiscussionDetail(discussion.id)"
            >
              <!-- 从内容中提取图片作为封面 -->
              <div v-if="discussion.coverImage" class="cover-image">
                <v-img
                  :src="discussion.coverImage"
                  cover
                  :aspect-ratio="discussion.imageAspectRatio || getRandomAspectRatio()"
                  class="rounded-t-lg"
                ></v-img>
              </div>

              <div class="card-content">
                <h3 class="xiaohongshu-title">
                  {{ getDiscussionTitle(discussion.content) || t('spaces.discussions.untitled') }}
                </h3>

                <div class="xiaohongshu-preview">
                  {{ getDiscussionPreviewText(discussion.content) }}
                </div>

                <div class="d-flex align-center mt-3">
                  <v-avatar size="28" class="mr-2">
                    <v-img :src="getAvatarUrl(discussion.sender.avatarId)"></v-img>
                  </v-avatar>
                  <span class="xiaohongshu-username">{{ discussion.sender.nickname }}</span>
                  <v-spacer></v-spacer>
                  <div class="d-flex align-center">
                    <v-btn
                      v-if="discussion.subDiscussions && discussion.subDiscussions.count > 0"
                      density="comfortable"
                      variant="text"
                      size="small"
                      icon="mdi-comment-outline"
                      class="xiaohongshu-action mr-1"
                    ></v-btn>
                    <span
                      v-if="discussion.subDiscussions && discussion.subDiscussions.count > 0"
                      class="xiaohongshu-count"
                    >
                      {{ discussion.subDiscussions.count }}
                    </span>
                    <v-btn
                      density="comfortable"
                      variant="text"
                      size="small"
                      icon="mdi-heart-outline"
                      class="xiaohongshu-action ml-2"
                    ></v-btn>
                  </div>
                </div>
              </div>
            </div>
          </wc-waterfall>

          <template #skeleton>
            <div class="skeleton-loading-container">
              <wc-waterfall :cols="cols" :gap="12" class="discussions-waterfall">
                <DiscussionCardSkeleton v-for="n in pageSize" :key="`skeleton-${n}`" />
              </wc-waterfall>
            </div>
          </template>

          <template #empty>
            <div class="empty-discussions-container">
              <div class="empty-discussions-content">
                <v-icon size="64" class="empty-icon mb-4" color="primary" opacity="0.8"
                  >mdi-comment-text-outline</v-icon
                >
                <h3 class="text-h6 font-weight-medium mb-1">{{ t('spaces.discussions.noDiscussions') }}</h3>
                <p class="text-body-1 text-medium-emphasis mb-6 text-center">
                  {{ t('spaces.discussions.startDiscussion') || '这里还没有讨论，开始第一个话题吧！' }}
                </p>
                <v-btn
                  color="primary"
                  rounded="pill"
                  prepend-icon="mdi-plus-circle-outline"
                  @click="navigateToCreateDiscussion"
                >
                  {{ t('spaces.discussions.newDiscussion') }}
                </v-btn>
              </div>
            </div>
          </template>
        </InfiniteScroll>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { DiscussionWithUI, Page } from '@/types'

import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { getAvatarUrl, getFullAttachmentUrl } from '@/utils/materials'

import { useWindowSize } from '@/composables/useWindowSize'

import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import DiscussionCardSkeleton from '@/components/discussions/DiscussionCardSkeleton.vue'
import { AttachmentsApi } from '@/network/api/attachments'
import { DiscussionsApi } from '@/network/api/discussions'

dayjs.extend(relativeTime)

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { width } = useWindowSize()

// 扩展DiscussionWithUI类型来包含封面图片
interface EnhancedDiscussion extends DiscussionWithUI {
  coverImage?: string
  imageAspectRatio?: number
}

const discussions = ref<EnhancedDiscussion[]>([])
const isInitialLoading = ref(true)
const isLoadingMore = ref(false)
const pageSize = ref(12)
const pageInfo = ref<Page>({ pageStart: 1, pageSize: pageSize.value, hasMore: true, nextStart: 1, total: 0 })

const spaceId = computed(() => Number(route.params.spaceId))

// Responsive columns based on viewport width, like XiaoHongShu
const cols = computed(() => {
  if (width.value < 600) return 2
  if (width.value < 960) return 3
  if (width.value < 1264) return 4
  return 5
})

const fetchDiscussions = async (cursor?: number) => {
  if (!spaceId.value) return

  let isInitialLoadAttempt = cursor === undefined

  if (isInitialLoadAttempt) {
    isInitialLoading.value = true
    // discussions.value = [] // Keep this if you want to clear old data immediately
  } else {
    isLoadingMore.value = true
  }

  try {
    const apiParams: {
      modelType: 'SPACE'
      modelId: number
      pageSize: number
      sort_by: 'createdAt' | 'updatedAt'
      sort_order: 'desc' | 'asc'
      pageStart?: number
    } = {
      modelType: 'SPACE',
      modelId: spaceId.value,
      pageStart: cursor,
      pageSize: pageSize.value,
      sort_by: 'createdAt',
      sort_order: 'desc',
    }

    const { data } = await DiscussionsApi.list(apiParams)
    const newDiscussions = data.discussions as EnhancedDiscussion[]

    for (const discussion of newDiscussions) {
      const imageInfo = extractImageInfo(discussion.content)
      if (imageInfo) {
        if (imageInfo.type === 'image' && imageInfo.src) {
          discussion.coverImage = imageInfo.src
          if (imageInfo.width && imageInfo.height && imageInfo.height > 0) {
            discussion.imageAspectRatio = imageInfo.width / imageInfo.height
          }
        } else if (imageInfo.type === 'attachmentImage' && imageInfo.attachmentId) {
          try {
            const { data: attachmentData } = await AttachmentsApi.detail(imageInfo.attachmentId)
            discussion.coverImage = getFullAttachmentUrl(attachmentData.attachment.url)
            const meta = attachmentData.attachment.meta
            if (meta && 'width' in meta && 'height' in meta && meta.height > 0) {
              discussion.imageAspectRatio = meta.width / meta.height
            }
          } catch (error) {
            console.error('Failed to fetch attachment:', error)
          }
        }
      }
    }

    if (isInitialLoadAttempt) {
      discussions.value = newDiscussions
    } else {
      discussions.value.push(...newDiscussions)
    }
    pageInfo.value = data.page

    if (isInitialLoadAttempt) {
      // Ensure discussions array update is processed before hiding loader
      await nextTick()
    }
  } catch (error) {
    console.error('Failed to fetch discussions:', error)
    toast.error(t('spaces.discussions.loadFailed'))
  } finally {
    if (isInitialLoadAttempt) {
      isInitialLoading.value = false
    }
    isLoadingMore.value = false
  }
}

// 提取图片信息，返回图片类型和源/ID
const extractImageInfo = (
  content: string
): {
  type: string
  src?: string
  attachmentId?: number
  width?: number
  height?: number
} | null => {
  try {
    const parsedContent = JSON.parse(content)

    // 扁平化递归搜索所有节点，查找图片
    const findImage = (
      node: any
    ): {
      type: string
      src?: string
      attachmentId?: number
      width?: number
      height?: number
    } | null => {
      // 如果是标准图片节点
      if (node.type === 'image' && node.attrs) {
        return {
          type: 'image',
          src: node.attrs.src,
          width: node.attrs.width,
          height: node.attrs.height,
        }
      }

      // 如果是附件图片节点
      if (node.type === 'attachmentImage' && node.attrs) {
        return {
          type: 'attachmentImage',
          attachmentId: node.attrs.attachmentId,
          width: node.attrs.width,
          height: node.attrs.height,
        }
      }

      // 如果有子节点，递归搜索
      if (node.content && Array.isArray(node.content)) {
        for (const child of node.content) {
          const result = findImage(child)
          if (result) return result
        }
      }

      return null
    }

    // 在根节点的内容中搜索
    if (parsedContent.content && Array.isArray(parsedContent.content)) {
      for (const node of parsedContent.content) {
        const imageInfo = findImage(node)
        if (imageInfo) return imageInfo
      }
    }
  } catch (e) {
    console.log('Error parsing content for image', e)
  }

  return null
}

const loadMoreDiscussions = () => {
  if (pageInfo.value.hasMore && pageInfo.value.nextStart) {
    fetchDiscussions(pageInfo.value.nextStart)
  }
}

const parseContent = (content: string) => {
  try {
    return JSON.parse(content)
  } catch (e) {
    return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] }
  }
}

const getDiscussionTitle = (content: string): string => {
  try {
    const parsedContent = JSON.parse(content)
    if (parsedContent.content && parsedContent.content.length > 0) {
      for (const node of parsedContent.content) {
        if (
          node.type === 'heading' &&
          node.attrs?.level === 1 &&
          node.content &&
          node.content.length > 0 &&
          node.content[0].text
        ) {
          return node.content[0].text.trim()
        }
        if (node.type === 'paragraph' && node.content && node.content.length > 0) {
          const text = node.content.map((n: any) => n.text || '').join('')
          if (text.trim()) return text.trim().substring(0, 36) + (text.length > 36 ? '...' : '')
        }
      }
    }
  } catch (e) {
    // If not JSON or cannot parse, use the first 50 chars of plain text
    const plainText = content.replace(/<[^>]*>/g, '').trim()
    return plainText.substring(0, 36) + (plainText.length > 36 ? '...' : '')
  }
  return '' // Return empty if no suitable title found
}

// 提取讨论内容的纯文本预览
const getDiscussionPreviewText = (content: string): string => {
  try {
    const parsedContent = JSON.parse(content)
    let text = ''

    const extractText = (node: any): void => {
      // 如果是文本节点，添加文本
      if (node.type === 'text' && node.text) {
        text += node.text + ' '
        return
      }

      // 如果有子节点，递归提取
      if (node.content && Array.isArray(node.content)) {
        for (const child of node.content) {
          extractText(child)
        }
      }
    }

    // 开始提取纯文本
    if (parsedContent.content && Array.isArray(parsedContent.content)) {
      for (const node of parsedContent.content) {
        // 跳过标题和图片节点
        if (node.type === 'heading' || node.type === 'image' || node.type === 'attachmentImage') {
          continue
        }
        extractText(node)
      }
    }

    // 截断并添加省略号
    text = text.trim()
    if (text.length > 100) {
      text = text.substring(0, 100) + '...'
    }

    return text
  } catch (e) {
    // 解析错误时返回空字符串
    return ''
  }
}

// 生成随机长宽比，使瀑布流更自然
const getRandomAspectRatio = (): number => {
  const ratios = [0.8, 1, 1.2, 1.5]
  return ratios[Math.floor(Math.random() * ratios.length)]
}

const navigateToDiscussionDetail = (discussionIdParam: number) => {
  router.push({
    name: 'SpacesDetailDiscussionItem',
    params: { spaceId: spaceId.value, discussionId: discussionIdParam },
  })
}

const navigateToCreateDiscussion = () => {
  router.push({ name: 'SpacesDetailCreateDiscussion', params: { spaceId: spaceId.value } })
}

onMounted(() => {
  fetchDiscussions() // Initial load
})

watch(
  () => route.params.spaceId,
  (newSpaceId, oldSpaceId) => {
    if (newSpaceId !== oldSpaceId && newSpaceId !== undefined) {
      fetchDiscussions() // Reset and fetch for new space
    }
  },
  { immediate: false }
)
</script>

<style scoped lang="scss">
.discussions-scroll-container {
  min-height: 400px;
}

.discussions-waterfall {
  width: 100%;
}

.xiaohongshu-card {
  background-color: rgb(var(--v-theme-surface));
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  animation: fade-in 0.5s ease-in;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}

.cover-image {
  width: 100%;
  overflow: hidden;
}

.card-content {
  padding: 12px;
}

.xiaohongshu-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.xiaohongshu-preview {
  max-height: 80px;
  overflow: hidden;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.75);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.xiaohongshu-username {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.xiaohongshu-action {
  color: rgba(var(--v-theme-on-surface), 0.6);
  padding: 0 !important;
  min-width: 24px !important;
  height: 24px !important;
}

.xiaohongshu-count {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-discussions-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 400px;
  background-color: rgba(var(--v-theme-surface), 0.6);
  border-radius: 16px;
  backdrop-filter: blur(5px);
}

.empty-discussions-content {
  max-width: 400px;
  text-align: center;
  animation: fade-in 0.6s ease-out;
}

.empty-icon {
  display: inline-block;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.skeleton-loading-container {
  padding: 0; // Adjust as needed, or remove if wc-waterfall handles spacing
  animation: fade-in 0.3s ease-out;
}
</style>
