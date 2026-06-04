<template>
  <v-sheet flat rounded="lg" class="member-page">
    <div class="member-page__hero">
      <div>
        <h1 class="member-page__title">我发布的赛题</h1>
      </div>

      <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="navigateToPublishTask">发布赛题</v-btn>
    </div>

    <v-row dense class="mt-1">
      <template v-if="overviewLoading && !overview">
        <v-col v-for="index in 4" :key="index" cols="12" sm="6" xl="3">
          <v-skeleton-loader type="article" rounded="lg" />
        </v-col>
      </template>
      <template v-else>
        <v-col cols="12" sm="6" xl="3">
          <MemberOverviewCard
            icon="mdi-clipboard-clock-outline"
            tone="warning"
            label="待审核题目"
            :value="formatCount(overview?.pendingTaskApprovalCount)"
            helper="还在等待空间管理员审核的题目数"
          />
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <MemberOverviewCard
            icon="mdi-account-alert-outline"
            tone="warning"
            label="待审核报名"
            :value="formatCount(overview?.pendingParticipantApprovalCount)"
            helper="需要你尽快确认的报名主体"
          />
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <MemberOverviewCard
            icon="mdi-clipboard-text-clock-outline"
            tone="info"
            label="待评审提交"
            :value="formatCount(overview?.pendingReviewCount)"
            helper="已经提交但还没有完成评审的作品"
          />
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <MemberOverviewCard
            icon="mdi-trophy-outline"
            tone="success"
            label="成功主体数"
            :value="formatCount(overview?.successfulParticipantCount)"
            helper="当前空间内通过你题目的成功主体"
          />
        </v-col>
      </template>
    </v-row>

    <v-card flat rounded="lg" class="filter-card mt-5">
      <div class="filter-card__header">
        <div class="filter-card__title">筛选</div>
        <v-btn variant="text" color="primary" @click="clearFilters">清空筛选</v-btn>
      </div>

      <div class="filter-grid">
        <v-select
          v-model="categoryIdModel"
          :items="categoryItems"
          label="分类"
          density="comfortable"
          hide-details
          variant="outlined"
        />
        <v-select
          v-model="approvedModel"
          :items="approvedItems"
          label="题目审批状态"
          density="comfortable"
          hide-details
          variant="outlined"
        />
        <v-select
          v-model="sortByModel"
          :items="sortByItems"
          label="排序字段"
          density="comfortable"
          hide-details
          variant="outlined"
        />
        <v-select
          v-model="sortOrderModel"
          :items="sortOrderItems"
          label="排序方向"
          density="comfortable"
          hide-details
          variant="outlined"
        />
      </div>

      <div class="filter-chips">
        <v-chip
          :variant="filters.hasPendingParticipantApproval ? 'flat' : 'outlined'"
          color="warning"
          @click="togglePendingParticipantApproval"
        >
          待审核报名
        </v-chip>
        <v-chip :variant="filters.hasPendingReview ? 'flat' : 'outlined'" color="info" @click="togglePendingReview">
          待评审提交
        </v-chip>
      </div>
    </v-card>

    <div class="list-section">
      <template v-if="listLoading && !tasks.length">
        <v-skeleton-loader v-for="index in 3" :key="index" type="article" rounded="lg" class="mb-4" />
      </template>

      <template v-else-if="!tasks.length">
        <v-empty-state
          icon="mdi-pencil-box-multiple-outline"
          title="还没有发布记录"
          text="你在这个空间下还没有发布过赛题，发布后会在这里集中查看审核和参与状态。"
        />
        <div class="empty-actions">
          <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="navigateToPublishTask">去发布赛题</v-btn>
        </div>
      </template>

      <template v-else>
        <MyPublishedTaskCard v-for="task in tasks" :key="task.taskId" :task="task" :space-id="spaceId" class="mb-4" />
      </template>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import type { SpaceMyPublishedTask, SpaceMyPublishingOverview } from '@/network/api/spaces/types'

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { storeToRefs } from 'pinia'

import MemberOverviewCard from './components/MemberOverviewCard.vue'
import MyPublishedTaskCard from './components/MyPublishedTaskCard.vue'
import { formatCount } from './helpers'
import {
  buildMyPublishingApiParams,
  type MemberApproveFilter,
  type MemberSortOrder,
  type MyPublishingSortBy,
  normalizePublishingQuery,
  serializePublishingQuery,
} from './utils'

import { SpacesApi } from '@/network/api/spaces'
import { useSpaceStore } from '@/stores/space'

const route = useRoute()
const router = useRouter()

const spaceStore = useSpaceStore()
const { currentSpaceId, currentSpace, categories } = storeToRefs(spaceStore)
const { fetchCategories } = spaceStore

const spaceId = computed(() => Number(route.params.spaceId))
const filters = computed(() => normalizePublishingQuery(route.query as Record<string, unknown>))

const overview = ref<null | SpaceMyPublishingOverview>(null)
const tasks = ref<SpaceMyPublishedTask[]>([])
const overviewLoading = ref(false)
const listLoading = ref(false)

const replaceFilters = async (partial: Record<string, unknown>) => {
  const next = normalizePublishingQuery({
    ...serializePublishingQuery(filters.value),
    ...partial,
  })

  await router.replace({
    query: serializePublishingQuery(next),
  })
}

const categoryIdModel = computed({
  get: () => filters.value.categoryId ?? null,
  set: (value: null | number) => {
    replaceFilters({ categoryId: value ?? undefined }).catch(() => undefined)
  },
})

const approvedModel = computed({
  get: () => filters.value.approved,
  set: (value: MemberApproveFilter) => {
    replaceFilters({ approved: value }).catch(() => undefined)
  },
})

const sortByModel = computed({
  get: () => filters.value.sortBy,
  set: (value: MyPublishingSortBy) => {
    replaceFilters({ sortBy: value }).catch(() => undefined)
  },
})

const sortOrderModel = computed({
  get: () => filters.value.sortOrder,
  set: (value: MemberSortOrder) => {
    replaceFilters({ sortOrder: value }).catch(() => undefined)
  },
})

const categoryItems = computed(() => [
  { title: '全部分类', value: null },
  ...categories.value.filter((item) => !item.archivedAt).map((item) => ({ title: item.name, value: item.id })),
])

const approvedItems = [
  { title: '全部', value: 'ALL' },
  { title: '待审核', value: 'NONE' },
  { title: '已通过', value: 'APPROVED' },
  { title: '未通过', value: 'DISAPPROVED' },
]

const sortByItems = [
  { title: '最新发布', value: 'createdAt' },
  { title: '报名主体数', value: 'participantCount' },
  { title: '待评审数', value: 'pendingReviewCount' },
  { title: '成功率', value: 'successRate' },
]

const sortOrderItems = [
  { title: '降序', value: 'desc' },
  { title: '升序', value: 'asc' },
]

const loadOverview = async () => {
  overviewLoading.value = true
  try {
    const { data } = await SpacesApi.getMyPublishingOverview(spaceId.value)
    overview.value = data
  } catch (error) {
    console.error('load my publishing overview failed', error)
    toast.error('加载发布概览失败')
  } finally {
    overviewLoading.value = false
  }
}

const loadTasks = async () => {
  listLoading.value = true
  try {
    const { data } = await SpacesApi.getMyPublishedTasks(spaceId.value, buildMyPublishingApiParams(filters.value))
    tasks.value = data.tasks
  } catch (error) {
    console.error('load my publishing tasks failed', error)
    toast.error('加载我发布的赛题失败')
  } finally {
    listLoading.value = false
  }
}

const clearFilters = async () => {
  await router.replace({ query: {} })
}

const togglePendingParticipantApproval = async () => {
  await replaceFilters({
    hasPendingParticipantApproval: filters.value.hasPendingParticipantApproval ? undefined : true,
  })
}

const togglePendingReview = async () => {
  await replaceFilters({
    hasPendingReview: filters.value.hasPendingReview ? undefined : true,
  })
}

const navigateToPublishTask = async () => {
  try {
    if (currentSpace.value) {
      const taskTemplates = JSON.parse(currentSpace.value.taskTemplates || '[]')
      const query: Record<string, string> = {}
      if (filters.value.categoryId) {
        query.categoryId = String(filters.value.categoryId)
      }

      if (taskTemplates.length > 0) {
        await router.push({
          name: 'SpacesDetailSelectTemplate',
          params: { spaceId: route.params.spaceId },
          query,
        })
      } else {
        await router.push({
          name: 'SpacesDetailPublishTask',
          params: { spaceId: route.params.spaceId },
          query,
        })
      }
    }
  } catch (error) {
    console.error('navigate to publish task failed', error)
    await router.push({ name: 'SpacesDetailPublishTask', params: { spaceId: route.params.spaceId } })
  }
}

watch(
  currentSpaceId,
  (value) => {
    if (value) {
      fetchCategories().catch(() => undefined)
    }
  },
  { immediate: true }
)

watch(
  [spaceId, filters],
  () => {
    loadTasks().catch(() => undefined)
  },
  { immediate: true }
)

watch(
  spaceId,
  () => {
    loadOverview().catch(() => undefined)
  },
  { immediate: true }
)

onMounted(() => {
  fetchCategories().catch(() => undefined)
})
</script>

<style scoped lang="scss">
.member-page {
  padding: 20px;
}

.member-page__hero {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
}

.member-page__title {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.25;
}

.filter-card {
  padding: 18px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.filter-card__header {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
}

.filter-card__title {
  font-size: 1rem;
  font-weight: 600;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.filter-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.list-section {
  margin-top: 22px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 960px) {
  .member-page {
    padding: 16px;
  }

  .member-page__hero,
  .filter-card__header {
    flex-direction: column;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
