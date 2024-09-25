<template>
  <v-sheet flat rounded="lg">
    <div class="d-flex align-center pa-4 tasks-header">
      <v-text-field
        v-model="searchQuery"
        density="compact"
        flat
        hide-details
        label="在当前空间中搜索"
        prepend-inner-icon="mdi-magnify"
        rounded="lg"
        single-line
        variant="solo-filled"
        class="flex-grow-1"
      ></v-text-field>
      <div class="d-flex align-center tasks-header-selects">
        <v-select
          v-model="selectedSort"
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
      <v-btn variant="flat" :to="{ name: 'SpacesDetailPublishTask', params: { spaceId } }">
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
        <v-card
          v-for="task in tasks"
          :key="task.id"
          flat
          border
          rounded="lg"
          class="d-flex flex-row pa-4 tasks-list-item"
          :to="{ name: 'TasksDetail', params: { taskId: task.id } }"
        >
          <div class="d-flex flex-column flex-grow-1">
            <div class="text-subtitle-2 text-medium-emphasis">
              {{ task.creator.nickname }} 发布于 {{ dayjs(task.createdAt).format('YYYY-MM-DD HH:mm') }}
            </div>
            <div class="text-h6">{{ task.name }}</div>
            <div class="text-subtitle-1 text-medium-emphasis">{{ task.description }}</div>
          </div>
          <div class="d-flex flex-column align-end">
            <div class="text-primary">
              <template v-if="new Date(task.deadline) < new Date()"> 已结束 </template>
              <template v-else> 进行中 </template>
            </div>
            <div class="text-subtitle-2 text-medium-emphasis">
              <v-icon left>mdi-alarm</v-icon>
              {{ dayjs(task.deadline).format('YYYY-MM-DD HH:mm') }}
            </div>
            <div class="text-subtitle-2 text-medium-emphasis">
              <v-icon left>mdi-account-multiple</v-icon>
              {{ task.submitters.total }}
            </div>
          </div>
        </v-card>
      </infinite-scroll>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { TasksApi } from '@/network/api/tasks'
import { ref, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { usePaging } from '@/utils/paging'
import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
const searchQuery = ref('')
const selectedSort = ref<{ by: 'createdAt' | 'updatedAt' | 'deadline'; order: 'asc' | 'desc' }>({
  by: 'createdAt',
  order: 'desc',
})

const sortOptions = ref([
  { title: '最新发布', value: { by: 'createdAt', order: 'desc' } },
  { title: '最新更新', value: { by: 'updatedAt', order: 'desc' } },
  { title: '最近截止', value: { by: 'deadline', order: 'asc' } },
])

const route = useRoute()
const spaceId = Number(route.params.spaceId)

const {
  data: tasks,
  refresh,
  loadMore,
  reset,
  hasMore,
  refreshing,
  loadingMore,
} = usePaging(
  async (pageStart, sort) => {
    const { data } = await TasksApi.list({
      space: spaceId,
      sort_by: sort?.by ?? 'createdAt',
      sort_order: sort?.order ?? 'desc',
    })
    return { data: data.tasks, page: data.page }
  },
  undefined,
  selectedSort.value
)

watch(
  selectedSort,
  async (newVal) => {
    reset(undefined, newVal)
    await refresh()
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

.tasks-list-item {
  gap: 16px;
}
</style>
