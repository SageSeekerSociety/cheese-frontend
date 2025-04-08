<template>
  <v-sheet flat rounded="lg" class="task-container">
    <!-- 顶部导航和筛选区 -->
    <div class="filter-section pa-4 pb-0">
      <!-- 主分类选项按钮在移动端显示 -->
      <div class="d-md-none category-nav-mobile mb-4">
        <v-select
          v-model="selectedCategoryOrType"
          :items="allFilterOptions"
          density="comfortable"
          variant="outlined"
          hide-details
          class="category-select"
        ></v-select>
      </div>

      <!-- 过滤和搜索选项 -->
      <div class="filter-options mb-2">
        <!-- 搜索框和发布按钮一行 -->
        <div class="d-flex flex-wrap align-center gap-4 mb-4">
          <v-form class="search-container flex-grow-1" @submit.prevent="submitSearch">
            <v-text-field
              v-model="searchQueryInput"
              density="compact"
              hide-details
              :placeholder="t('spaces.detail.tasks.searchPlaceholder')"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              rounded="lg"
              bg-color="grey-lighten-4"
              class="search-input"
            ></v-text-field>
          </v-form>

          <v-btn
            color="primary"
            class="publish-btn d-none d-md-flex ms-1"
            prepend-icon="mdi-plus"
            rounded="lg"
            @click="navigateToPublishTask"
          >
            {{ t('spaces.detail.tasks.publishTask') }}
          </v-btn>

          <v-btn color="primary" class="d-md-none" icon="mdi-plus" @click="navigateToPublishTask"></v-btn>
        </div>

        <!-- 筛选选项使用标签/片段 -->
        <div class="filter-groups d-flex flex-wrap align-center justify-space-between">
          <!-- 排序选项 -->
          <div class="filter-group mb-3">
            <div class="filter-title mb-2 text-medium-emphasis">
              <v-icon size="18" class="me-2 title-icon">mdi-sort-variant</v-icon>
              {{ t('spaces.detail.tasks.sort') }}
            </div>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="(option, index) in sortOptions"
                :key="index"
                :color="
                  selectedSortOption.by === option.value.by && selectedSortOption.order === option.value.order
                    ? 'primary'
                    : undefined
                "
                :variant="
                  selectedSortOption.by === option.value.by && selectedSortOption.order === option.value.order
                    ? 'flat'
                    : 'text'
                "
                density="comfortable"
                size="small"
                class="filter-chip"
                @click="selectedSortOption = option.value"
              >
                {{ option.title }}
              </v-chip>
            </div>
          </div>

          <!-- 话题选项 -->
          <div v-if="topicOptions.length > 1" class="filter-group mb-3">
            <div class="filter-title mb-2 text-medium-emphasis">
              <v-icon size="18" class="me-2 title-icon">mdi-tag-multiple</v-icon>
              {{ t('spaces.detail.tasks.topic') }}
            </div>
            <div class="d-flex flex-wrap gap-2">
              <!-- 显示常用/固定的话题选项 (最多4个) -->
              <v-chip
                v-for="option in displayedTopicOptions"
                :key="option?.value === null ? 'all' : option?.value ?? 'topic'"
                :color="selectedTopic === option?.value ? 'primary' : undefined"
                :variant="selectedTopic === option?.value ? 'flat' : 'text'"
                density="comfortable"
                size="small"
                class="filter-chip"
                @click="option && (selectedTopic = option.value)"
              >
                {{ option?.title }}
              </v-chip>

              <!-- 如果话题数量超过显示限制且选中的话题不在已显示的选项中，显示"更多"选项 -->
              <v-menu v-if="hasMoreHiddenTopics" location="bottom" :close-on-content-click="true">
                <template #activator="{ props }">
                  <v-chip
                    v-bind="props"
                    :color="isSelectedTopicHidden ? 'primary' : undefined"
                    :variant="isSelectedTopicHidden ? 'flat' : 'text'"
                    density="comfortable"
                    size="small"
                    class="filter-chip more-chip"
                  >
                    <template v-if="isSelectedTopicHidden">
                      {{ selectedHiddenTopic?.title }}
                    </template>
                    <template v-else>
                      {{ t('spaces.detail.tasks.moreTopics') }}
                    </template>
                    <v-icon size="small" end>mdi-chevron-down</v-icon>
                  </v-chip>
                </template>
                <v-card min-width="180" max-width="300" class="more-topics-menu pa-0">
                  <v-list density="compact" nav class="py-1">
                    <v-list-item
                      v-for="option in currentHiddenTopics"
                      :key="option?.value === null ? 'all-hidden' : option?.value ?? 'hidden-topic'"
                      :active="selectedTopic === option?.value"
                      :title="option?.title || ''"
                      density="compact"
                      class="topic-list-item"
                      @click="option && (selectedTopic = option.value)"
                    ></v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-divider class="mt-0"></v-divider>

    <div class="tasks-list">
      <infinite-scroll
        :loading="loadingMore"
        :has-more="hasMore"
        :initial-loading="refreshing"
        :is-empty="tasks.length === 0"
        @load-more="loadMore"
      >
        <template #empty>
          <v-empty-state icon="mdi-trophy" :title="t('spaces.detail.tasks.noTasks')"></v-empty-state>
        </template>
        <TaskCard v-for="task in tasks" :key="task.id" :task="task" class="tasks-list-item" />
      </infinite-scroll>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { usePaging } from '@/utils/paging'

import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import { TasksApi } from '@/network/api/tasks'
import { currentUserId } from '@/services/account'
import { useSpaceStore } from '@/stores/space'

const TaskCard = defineAsyncComponent(() => import('@/components/TaskCard.vue'))

type SortBy = 'createdAt' | 'updatedAt' | 'deadline'
type SortOrder = 'asc' | 'desc'

type QueryType = 'all' | 'published' | 'joined'
type QueryOptions = {
  space: number
  by: SortBy
  order: SortOrder
  keywords?: string
  owner?: number
  queryType: QueryType
  topics?: number[]
  categoryId?: number
}
const route = useRoute()
const router = useRouter()
const searchQueryInput = ref('')
const searchQuery = ref<string>()
const selectedTopic = ref<number | null>(null)

const { t } = useI18n()

const spaceStore = useSpaceStore()
const { currentSpace, classificationTopics, categories } = storeToRefs(spaceStore)

// 获取活跃分类列表
const activeCategories = computed(() => {
  return categories.value.filter((category) => !category.archivedAt).sort((a, b) => a.displayOrder - b.displayOrder)
})

// 获取当前选中的分类ID（从URL参数）
const selectedCategoryId = computed<number | null>(() => {
  const categoryParam = route.query.category
  if (!categoryParam) return null

  const categoryId = Number(categoryParam)
  // 确保分类在活跃分类列表中
  return activeCategories.value.some((cat) => cat.id === categoryId) ? categoryId : null
})

// 获取当前查询类型（全部、我发布的、我参与的）
const currentQueryType = computed<QueryType>(() => {
  const typeParam = route.query.type as QueryType
  return ['all', 'published', 'joined'].includes(typeParam) ? typeParam : 'all'
})

// 用于移动端的组合选择器选项
const allFilterOptions = computed(() => {
  const typeOptions = [
    { title: t('spaces.detail.allContests'), value: 'all-tasks' },
    { title: t('spaces.detail.myPublishedContests'), value: 'published' },
    { title: t('spaces.detail.myJoinedContests'), value: 'joined' },
  ]

  const categoryOptions = activeCategories.value.map((category) => ({
    title: category.name,
    value: `category-${category.id}`,
  }))

  return [...typeOptions, ...categoryOptions]
})

// 移动端组合选择器的值
const selectedCategoryOrType = computed({
  get() {
    if (selectedCategoryId.value) {
      return `category-${selectedCategoryId.value}`
    }
    return currentQueryType.value === 'all' ? 'all-tasks' : currentQueryType.value
  },
  set(value: string) {
    if (value.startsWith('category-')) {
      const categoryId = value.replace('category-', '')
      router.push({
        name: 'SpacesDetailTasks',
        params: { spaceId: route.params.spaceId },
        query: { category: categoryId },
      })
    } else if (['published', 'joined'].includes(value)) {
      router.push({
        name: 'SpacesDetailTasks',
        params: { spaceId: route.params.spaceId },
        query: { type: value },
      })
    } else {
      // 默认全部
      router.push({
        name: 'SpacesDetailTasks',
        params: { spaceId: route.params.spaceId },
        query: { type: 'all' },
      })
    }
  },
})

const sortOptions = ref<{ title: string; value: { by: SortBy; order: SortOrder } }[]>([
  { title: t('spaces.detail.tasks.sortOptions.latestPublished'), value: { by: 'createdAt', order: 'desc' } },
  { title: t('spaces.detail.tasks.sortOptions.latestUpdated'), value: { by: 'updatedAt', order: 'desc' } },
  { title: t('spaces.detail.tasks.sortOptions.nearestDeadline'), value: { by: 'deadline', order: 'asc' } },
])
const selectedSortOption = ref(sortOptions.value[0].value)

const queryOptions = computed<QueryOptions>(() => ({
  space: Number(route.params.spaceId),
  ...selectedSortOption.value,
  keywords: searchQuery.value ? searchQuery.value : undefined,
  queryType: currentQueryType.value,
  owner: currentQueryType.value === 'published' ? currentUserId.value : undefined,
  topics: selectedTopic.value !== null ? [selectedTopic.value] : undefined,
  categoryId: selectedCategoryId.value || undefined,
}))

const {
  data: tasks,
  refresh,
  loadMore,
  reset,
  hasMore,
  refreshing,
  loadingMore,
} = usePaging<Task, QueryOptions>(
  async (pageStart, queryOptions) => {
    if (!queryOptions || !queryOptions.space)
      return {
        data: [],
        page: { pageStart: 0, total: 0, pageSize: 0, hasMore: false, nextStart: 0 },
      }
    const { data } = await TasksApi.list({
      space: queryOptions.space,
      pageStart: pageStart,
      sort_by: queryOptions?.by ?? 'createdAt',
      sort_order: queryOptions?.order ?? 'desc',
      keywords: queryOptions?.keywords,
      approved: queryOptions.queryType !== 'published' ? 'APPROVED' : undefined,
      joined: queryOptions.queryType === 'joined' ? true : undefined,
      owner: queryOptions.owner,
      topics: queryOptions.topics,
      categoryId: queryOptions.categoryId,
      queryTopics: true,
      queryJoined: true,
    })
    return { data: data.tasks, page: data.page }
  },
  undefined,
  queryOptions.value
)

const submitSearch = () => {
  searchQuery.value = searchQueryInput.value
}

const topicOptions = computed<{ title: string; value: number | null }[]>(() => {
  return [
    {
      title: t('spaces.detail.tasks.allTopics'),
      value: null,
    },
    ...classificationTopics.value.map((topic) => ({
      title: topic.name,
      value: topic.id,
    })),
  ]
})

const navigateToPublishTask = async () => {
  try {
    if (currentSpace.value) {
      const taskTemplates = JSON.parse(currentSpace.value.taskTemplates || '[]')
      // 如果当前有选中的分类，将它作为查询参数传递（用于预选分类）
      const query: Record<string, string> = {}
      if (selectedCategoryId.value) {
        query.categoryId = String(selectedCategoryId.value)
      }

      if (taskTemplates.length > 0) {
        router.push({
          name: 'SpacesDetailSelectTemplate',
          params: { spaceId: route.params.spaceId },
          query,
        })
      } else {
        router.push({
          name: 'SpacesDetailPublishTask',
          params: { spaceId: route.params.spaceId },
          query,
        })
      }
    }
  } catch (error) {
    console.error('获取空间详情失败:', error)
    // 如果出错，直接跳转到发布赛题页面
    router.push({ name: 'SpacesDetailPublishTask', params: { spaceId: route.params.spaceId } })
  }
}

watch(
  queryOptions,
  (newVal) => {
    reset(undefined, newVal)
  },
  { deep: true }
)

// 限制直接显示的话题数量
const MAX_VISIBLE_TOPICS = 4

// 前4个固定显示的话题选项（不包括选中的隐藏话题）
const displayedTopicOptions = computed(() => {
  // 始终显示"全部"选项
  const allOption = topicOptions.value.find((option) => option.value === null)

  // 除"全部"外的其他选项（不考虑选中状态）
  const nonAllOptions = topicOptions.value.filter((option) => option.value !== null)

  // 无论选中什么，始终只显示前 MAX_VISIBLE_TOPICS - 1 个
  const fixedVisibleOptions = [allOption, ...nonAllOptions.slice(0, MAX_VISIBLE_TOPICS - 1)]

  return fixedVisibleOptions
})

// 检查选中的话题是否在隐藏列表中
const isSelectedTopicHidden = computed(() => {
  if (selectedTopic.value === null) return false

  return !displayedTopicOptions.value.some((option) => option?.value === selectedTopic.value)
})

// 获取当前选中的隐藏话题
const selectedHiddenTopic = computed(() => {
  if (!isSelectedTopicHidden.value) return null

  return topicOptions.value.find((option) => option.value === selectedTopic.value) || null
})

// 当前隐藏的话题（用于菜单显示）
const currentHiddenTopics = computed(() => {
  // 获取所有不在显示列表中的选项
  return topicOptions.value.filter(
    (option) =>
      option.value !== null && !displayedTopicOptions.value.some((displayed) => displayed?.value === option.value)
  )
})

// 是否显示"更多"菜单（只要有隐藏的话题就显示）
const hasMoreHiddenTopics = computed(() => {
  return currentHiddenTopics.value.length > 0
})

onMounted(async () => {
  await spaceStore.fetchCategories() // 获取分类列表
  await refresh()
})
</script>

<style scoped lang="scss">
.task-container {
  border: none;
}

.filter-section {
  transition: all 0.3s ease;
}

.category-nav-mobile {
  .category-select {
    border-radius: 8px;
  }
}

.filter-options {
  .search-container {
    position: relative;
  }

  .search-input {
    .v-field__input {
      min-height: 38px;
      padding-top: 0;
      padding-bottom: 0;
    }
  }

  .filter-groups {
    gap: 16px;
  }

  .filter-group {
    min-width: 200px;
  }

  .filter-title {
    font-weight: 500;
    font-size: 15px;
    color: rgba(var(--v-theme-on-surface), 0.9);
    display: flex;
    align-items: center;

    .title-icon {
      opacity: 0.8;
    }
  }

  .filter-chip {
    font-weight: normal;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .publish-btn {
    height: 40px;
    font-weight: 500;
    margin-left: 8px;
  }
}

.tasks-list {
  padding: 16px;

  .tasks-list-item:not(:last-child) {
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .filter-options {
    .filter-groups {
      flex-direction: column;
      align-items: stretch;

      .filter-group {
        width: 100%;
      }
    }
  }
}

.more-topics-menu {
  border-radius: 8px;
  overflow: hidden;

  .topic-list-item {
    min-height: 36px;

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.04);
    }
  }
}
</style>
