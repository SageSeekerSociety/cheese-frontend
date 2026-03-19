<template>
  <v-sheet flat rounded="lg" class="task-container">
    <!-- 顶部导航和筛选区 -->
    <div class="filter-section pa-4 pb-0">
      <!-- 主分类选项按钮在移动端显示 -->
      <div class="d-md-none category-nav-mobile mb-4">
        <v-select
          v-model="selectedCategoryIdModel"
          :items="categoryFilterOptions"
          density="comfortable"
          variant="outlined"
          hide-details
          class="category-select"
        ></v-select>
      </div>

      <!-- New Layout: Toolbar functionality -->
      <div class="filter-toolbar mb-4">
        <!-- Row 1: Search + Sort + Publish -->
        <div class="d-flex align-center flex-wrap gap-4 mb-3">
          <!-- Search -->
          <v-form class="search-container flex-grow-1" @submit.prevent="submitSearch">
            <v-text-field
              v-model="searchQueryInput"
              density="compact"
              hide-details
              :placeholder="t('spaces.detail.tasks.searchPlaceholder')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              bg-color="surface"
              class="search-input"
              rounded="lg"
            ></v-text-field>
          </v-form>

          <!-- Sort Dropdown -->
          <v-select
            v-model="selectedSortOption"
            :items="sortOptions"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-sort-variant"
            class="sort-select"
            style="max-width: 160px"
            rounded="lg"
            return-object
          ></v-select>

          <!-- Publish Button -->
          <v-btn
            color="primary"
            class="publish-btn d-none d-md-flex"
            prepend-icon="mdi-plus"
            rounded="lg"
            height="40"
            flat
            @click="navigateToPublishTask"
          >
            {{ t('spaces.detail.tasks.publishTask') }}
          </v-btn>
          <v-btn
            color="primary"
            class="d-md-none"
            icon="mdi-plus"
            variant="flat"
            @click="navigateToPublishTask"
          ></v-btn>
        </div>

        <!-- Row 2: Topic Filter Bar -->
        <div class="topic-filter-bar d-flex flex-wrap align-center gap-2">
          <!-- All Topics Chip -->
          <v-chip
            :color="selectedTopic === null ? 'primary' : undefined"
            :variant="selectedTopic === null ? 'flat' : 'outlined'"
            class="filter-chip"
            label
            @click="selectedTopic = null"
          >
            {{ t('spaces.detail.tasks.allTopics') }}
          </v-chip>

          <!-- Hot Topics -->
          <v-chip
            v-for="topic in displayedHotTopics"
            :key="topic.id"
            :color="selectedTopic === topic.id ? 'primary' : undefined"
            :variant="selectedTopic === topic.id ? 'flat' : 'outlined'"
            class="filter-chip"
            label
            @click="selectedTopic = topic.id"
          >
            {{ topic.name }}
          </v-chip>

          <!-- More Button -->
          <v-chip
            v-if="hotTopics.length > 10"
            variant="text"
            class="filter-chip px-2"
            density="compact"
            @click="showExpandedTopics = !showExpandedTopics"
          >
            {{ showExpandedTopics ? '收起' : '更多' }}
            <v-icon :icon="showExpandedTopics ? 'mdi-chevron-up' : 'mdi-chevron-down'" end size="small"></v-icon>
          </v-chip>
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
import type { Task, Topic } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { createEmptyResult, usePaging } from '@/utils/paging'

import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import { SpacesApi } from '@/network/api/spaces'
import { TasksApi } from '@/network/api/tasks'
import { useSpaceStore } from '@/stores/space'

const TaskCard = defineAsyncComponent(() => import('@/components/TaskCard.vue'))

type SortBy = 'createdAt' | 'updatedAt' | 'deadline'
type SortOrder = 'asc' | 'desc'

type QueryOptions = {
  space: number
  by: SortBy
  order: SortOrder
  keywords?: string
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
const { currentSpace, categories } = storeToRefs(spaceStore)

const hotTopics = ref<Topic[]>([])
const showExpandedTopics = ref(false)

const fetchHotTopics = async () => {
  const sId = Number(route.params.spaceId)
  if (!sId) return
  try {
    const { data } = await SpacesApi.getSpaceTopics(sId, 20, 'popularity')
    hotTopics.value = data.topics || []
  } catch (e) {
    console.error('Fetch top topics failed', e)
  }
}

const displayedHotTopics = computed(() => {
  if (showExpandedTopics.value) {
    return hotTopics.value
  }
  return hotTopics.value.slice(0, 10)
})

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

const categoryFilterOptions = computed(() => [
  { title: t('spaces.detail.allContests'), value: null },
  ...activeCategories.value.map((category) => ({
    title: category.name,
    value: category.id,
  })),
])

const selectedCategoryIdModel = computed({
  get() {
    return selectedCategoryId.value
  },
  set(value: null | number) {
    router.push({
      name: 'SpacesDetailTasksList',
      params: { spaceId: route.params.spaceId },
      query: value ? { category: String(value) } : {},
    })
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
  topics: selectedTopic.value !== null ? [selectedTopic.value] : undefined,
  categoryId: selectedCategoryId.value || undefined,
}))

const {
  data: tasks,
  loadMore,
  reset,
  hasMore,
  refreshing,
  loadingMore,
} = usePaging<Task, QueryOptions, string>(
  async (pageStart, queryOptions) => {
    if (!queryOptions || !queryOptions.space) return createEmptyResult<Task, string>()
    const { data } = await TasksApi.list({
      space: queryOptions.space,
      pageStart: pageStart,
      sort_by: queryOptions?.by ?? 'createdAt',
      sort_order: queryOptions?.order ?? 'desc',
      keywords: queryOptions?.keywords,
      approved: 'APPROVED',
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

onMounted(async () => {
  await spaceStore.fetchCategories() // 获取分类列表
  fetchHotTopics()
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
  }
}

.tasks-list {
  padding: 16px;

  .tasks-list-item:not(:last-child) {
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .filter-toolbar {
    /* Add responsive adjustments here if needed */
  }
}
</style>
