<template>
  <v-sheet flat rounded="lg">
    <div class="d-flex align-center pa-4 tasks-header">
      <v-form class="flex-grow-1" @submit.prevent="submitSearch">
        <v-text-field
          v-model="searchQueryInput"
          density="compact"
          flat
          hide-details
          label="在当前空间中搜索"
          prepend-inner-icon="mdi-magnify"
          rounded="lg"
          single-line
          variant="solo-filled"
        ></v-text-field>
      </v-form>
      <div class="d-flex align-center tasks-header-selects">
        <v-select
          v-model="selectedSortOption"
          :items="sortOptions"
          label="排序"
          density="compact"
          flat
          hide-details
          rounded="lg"
          single-line
          variant="solo-filled"
          style="min-width: auto"
          prepend-inner-icon="mdi-sort"
        ></v-select>
        <!-- <v-select
          v-model="selectedTag"
          :items="tagOptions"
          label="标签"
          density="compact"
          flat
          hide-details
          rounded="lg"
          single-line
          variant="solo-filled"
          style="min-width: auto"
          prepend-inner-icon="mdi-tag"
        ></v-select> -->
      </div>
      <v-btn variant="flat" @click="navigateToPublishTask">
        <v-icon left>mdi-plus</v-icon>
        发布赛题
      </v-btn>
    </div>
    <div class="tasks-list">
      <infinite-scroll
        :loading="loadingMore"
        :has-more="hasMore"
        :initial-loading="refreshing"
        :is-empty="tasks.length === 0"
        :on-load-more="loadMore"
      >
        <template #empty>
          <v-empty-state icon="mdi-trophy" title="暂无赛题"></v-empty-state>
        </template>
        <TaskCard v-for="task in tasks" :key="task.id" :task="task" class="tasks-list-item" />
      </infinite-scroll>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { TasksApi } from '@/network/api/tasks'
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaging } from '@/utils/paging'
import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import TaskCard from '@/components/TaskCard.vue'
import { Task } from '@/types'
import { currentUserId } from '@/services/account'
import { SpacesApi } from '@/network/api/spaces'

type SortBy = 'createdAt' | 'updatedAt' | 'deadline'
type SortOrder = 'asc' | 'desc'

type QueryType = 'all' | 'published'
type QueryOptions = {
  space: number
  by: SortBy
  order: SortOrder
  keywords?: string
  owner?: number
  queryType: QueryType
}
const route = useRoute()
const router = useRouter()
const searchQueryInput = ref('')
const searchQuery = ref<string>()

const sortOptions = ref<{ title: string; value: { by: SortBy; order: SortOrder } }[]>([
  { title: '最新发布', value: { by: 'createdAt', order: 'desc' } },
  { title: '最新更新', value: { by: 'updatedAt', order: 'desc' } },
  { title: '最近截止', value: { by: 'deadline', order: 'asc' } },
])
const selectedSortOption = ref(sortOptions.value[0].value)

const queryOptions = computed(() => ({
  space: Number(route.params.spaceId),
  ...selectedSortOption.value,
  keywords: searchQuery.value ? searchQuery.value : undefined,
  queryType: (route.query.type as QueryType) ?? 'all',
  owner: route.query.type === 'published' ? currentUserId.value : undefined,
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
    if (!queryOptions)
      return {
        data: [],
        page: { page_start: 0, total: 0, page_size: 0, has_prev: false, prev_start: 0, has_more: false, next_start: 0 },
      }
    const { data } = await TasksApi.list({
      space: queryOptions.space,
      page_start: pageStart,
      sort_by: queryOptions?.by ?? 'createdAt',
      sort_order: queryOptions?.order ?? 'desc',
      keywords: queryOptions?.keywords,
      approved: queryOptions.queryType === 'all' ? true : undefined,
      owner: queryOptions.owner,
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
    const response = await SpacesApi.detail(Number(route.params.spaceId))
    const taskTemplates = JSON.parse(response.data.space.taskTemplates || '[]')
    if (taskTemplates.length > 0) {
      router.push({ name: 'SpacesDetailSelectTemplate', params: { spaceId: route.params.spaceId } })
    } else {
      router.push({ name: 'SpacesDetailPublishTask', params: { spaceId: route.params.spaceId } })
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
  await refresh()
})
</script>

<style scoped lang="scss">
.tasks-header {
  gap: 8px;
}

.tasks-header-selects {
  gap: 8px;
}

.tasks-list {
  padding: 16px;
  gap: 16px;

  .tasks-list-item:not(:last-child) {
    margin-bottom: 16px;
  }
}
</style>
