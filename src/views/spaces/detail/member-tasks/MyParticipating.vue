<template>
  <v-sheet flat rounded="lg" class="member-page">
    <div class="member-page__hero">
      <div>
        <h1 class="member-page__title">我参与的赛题</h1>
      </div>

      <v-btn
        variant="outlined"
        rounded="lg"
        prepend-icon="mdi-compass-outline"
        :to="{ name: 'SpacesDetailTasksList', params: { spaceId } }"
      >
        去看全部赛题
      </v-btn>
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
            icon="mdi-timer-sand"
            tone="warning"
            label="待审核"
            :value="formatCount(overview?.pendingApprovalCount)"
            helper="报名还在等待老师或管理员确认"
          />
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <MemberOverviewCard
            icon="mdi-upload-outline"
            tone="primary"
            label="待提交"
            :value="formatCount(overview?.awaitingSubmissionCount)"
            helper="已经通过审核，但还没有完成提交"
          />
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <MemberOverviewCard
            icon="mdi-clipboard-text-clock-outline"
            tone="info"
            label="待评审"
            :value="formatCount(overview?.pendingReviewCount)"
            helper="作品已经提交，等待老师给出评审结果"
          />
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <MemberOverviewCard
            icon="mdi-refresh"
            tone="warning"
            label="可重提"
            :value="formatCount(overview?.resubmittableCount)"
            helper="被打回但仍然可以继续修改并重新提交"
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
          v-model="approvedModel"
          :items="approvedItems"
          label="报名审批状态"
          density="comfortable"
          hide-details
          variant="outlined"
        />
        <v-select
          v-model="completionStatusModel"
          :items="completionItems"
          label="完成状态"
          density="comfortable"
          hide-details
          variant="outlined"
        />
        <v-select
          v-model="identityTypeModel"
          :items="identityTypeItems"
          label="参与身份"
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
      </div>

      <div class="filter-grid filter-grid--secondary">
        <v-select
          v-model="sortOrderModel"
          :items="sortOrderItems"
          label="排序方向"
          density="comfortable"
          hide-details
          variant="outlined"
        />
      </div>
    </v-card>

    <div class="list-section">
      <template v-if="listLoading && !participations.length">
        <v-skeleton-loader v-for="index in 3" :key="index" type="article" rounded="lg" class="mb-4" />
      </template>

      <template v-else-if="!participations.length">
        <v-empty-state
          icon="mdi-account-check-outline"
          title="还没有参与记录"
          text="你在这个空间里还没有参与任何赛题，可以先去全部赛题里挑一个开始。"
        />
        <div class="empty-actions">
          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="mdi-compass-outline"
            :to="{ name: 'SpacesDetailTasksList', params: { spaceId } }"
          >
            去看全部赛题
          </v-btn>
        </div>
      </template>

      <template v-else>
        <MyParticipationCard
          v-for="item in participations"
          :key="item.participationId"
          :participation="item"
          :space-id="spaceId"
          class="mb-4"
        />
      </template>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import type { SpaceMyParticipatingOverview, SpaceMyParticipation } from '@/network/api/spaces/types'

import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'

import MemberOverviewCard from './components/MemberOverviewCard.vue'
import MyParticipationCard from './components/MyParticipationCard.vue'
import { formatCount } from './helpers'
import {
  buildMyParticipatingApiParams,
  type MemberApproveFilter,
  type MemberCompletionFilter,
  type MemberIdentityFilter,
  type MemberSortOrder,
  type MyParticipatingSortBy,
  normalizeParticipatingQuery,
  serializeParticipatingQuery,
} from './utils'

import { SpacesApi } from '@/network/api/spaces'

const route = useRoute()
const router = useRouter()

const spaceId = computed(() => Number(route.params.spaceId))
const filters = computed(() => normalizeParticipatingQuery(route.query as Record<string, unknown>))

const overview = ref<null | SpaceMyParticipatingOverview>(null)
const participations = ref<SpaceMyParticipation[]>([])
const overviewLoading = ref(false)
const listLoading = ref(false)

const replaceFilters = async (partial: Record<string, unknown>) => {
  const next = normalizeParticipatingQuery({
    ...serializeParticipatingQuery(filters.value),
    ...partial,
  })

  await router.replace({
    query: serializeParticipatingQuery(next),
  })
}

const approvedModel = computed({
  get: () => filters.value.approved,
  set: (value: MemberApproveFilter) => {
    replaceFilters({ approved: value }).catch(() => undefined)
  },
})

const completionStatusModel = computed({
  get: () => filters.value.completionStatus,
  set: (value: MemberCompletionFilter) => {
    replaceFilters({ completionStatus: value }).catch(() => undefined)
  },
})

const identityTypeModel = computed({
  get: () => filters.value.identityType,
  set: (value: MemberIdentityFilter) => {
    replaceFilters({ identityType: value }).catch(() => undefined)
  },
})

const sortByModel = computed({
  get: () => filters.value.sortBy,
  set: (value: MyParticipatingSortBy) => {
    replaceFilters({ sortBy: value }).catch(() => undefined)
  },
})

const sortOrderModel = computed({
  get: () => filters.value.sortOrder,
  set: (value: MemberSortOrder) => {
    replaceFilters({ sortOrder: value }).catch(() => undefined)
  },
})

const approvedItems = [
  { title: '全部', value: 'ALL' },
  { title: '待审核', value: 'NONE' },
  { title: '已通过', value: 'APPROVED' },
  { title: '未通过', value: 'DISAPPROVED' },
]

const completionItems = [
  { title: '全部', value: 'ALL' },
  { title: '待提交', value: 'NOT_SUBMITTED' },
  { title: '待评审', value: 'PENDING_REVIEW' },
  { title: '可重提', value: 'REJECTED_RESUBMITTABLE' },
  { title: '未完成', value: 'FAILED' },
  { title: '已成功', value: 'SUCCESS' },
]

const identityTypeItems = [
  { title: '全部', value: 'ALL' },
  { title: '个人参与', value: 'USER' },
  { title: '团队参与', value: 'TEAM' },
]

const sortByItems = [
  { title: '最近加入', value: 'joinedAt' },
  { title: '截止时间', value: 'deadline' },
  { title: '最近提交', value: 'latestSubmissionAt' },
  { title: '完成状态', value: 'completionStatus' },
]

const sortOrderItems = [
  { title: '降序', value: 'desc' },
  { title: '升序', value: 'asc' },
]

const loadOverview = async () => {
  overviewLoading.value = true
  try {
    const { data } = await SpacesApi.getMyParticipatingOverview(spaceId.value)
    overview.value = data
  } catch (error) {
    console.error('load my participating overview failed', error)
    toast.error('加载参与概览失败')
  } finally {
    overviewLoading.value = false
  }
}

const loadParticipations = async () => {
  listLoading.value = true
  try {
    const { data } = await SpacesApi.getMyParticipations(spaceId.value, buildMyParticipatingApiParams(filters.value))
    participations.value = data.participations
  } catch (error) {
    console.error('load my participations failed', error)
    toast.error('加载我参与的赛题失败')
  } finally {
    listLoading.value = false
  }
}

const clearFilters = async () => {
  await router.replace({ query: {} })
}

watch(
  [spaceId, filters],
  () => {
    loadParticipations().catch(() => undefined)
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

.filter-grid--secondary {
  grid-template-columns: minmax(0, 1fr);
  max-width: 220px;
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

  .filter-grid,
  .filter-grid--secondary {
    grid-template-columns: 1fr;
    max-width: none;
  }
}
</style>
