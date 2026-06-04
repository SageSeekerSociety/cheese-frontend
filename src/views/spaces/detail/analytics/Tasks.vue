<template>
  <div class="analytics-section">
    <div class="section-toolbar">
      <div>
        <h2 class="section-toolbar__title">题目分析</h2>
      </div>

      <AnalyticsExportButton section="tasks" :space-id="spaceId" :filters="filters" label="导出题目清单" />
    </div>

    <v-card flat rounded="lg" class="toolbar-card">
      <div class="toolbar-grid">
        <AnalyticsPublisherSelect v-model="publisherIdModel" :space-id="spaceId" :filters="filters" />
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

      <div class="toolbar-chips">
        <v-chip :variant="hasPendingApprovalModel ? 'flat' : 'outlined'" color="warning" @click="togglePendingApproval">
          待审核报名
        </v-chip>
        <v-chip :variant="hasPendingReviewModel ? 'flat' : 'outlined'" color="error" @click="togglePendingReview">
          待评审提交
        </v-chip>
      </div>
    </v-card>

    <v-card flat rounded="lg" class="table-card mt-4">
      <v-data-table :headers="headers" :items="tasks" :loading="loading" density="comfortable" items-per-page="10">
        <template #[`item.publisher`]="{ item }">{{ item.publisher?.name || '-' }}</template>
        <template #[`item.category`]="{ item }">{{ item.category?.name || '-' }}</template>
        <template #[`item.approved`]="{ item }">
          <v-chip size="small" :color="approvalColor(item.approved)" variant="tonal">{{
            approvalText(item.approved)
          }}</v-chip>
        </template>
        <template #[`item.createdAt`]="{ item }">{{ new Date(item.createdAt).toLocaleDateString('zh-CN') }}</template>
        <template #[`item.deadline`]="{ item }">
          {{ item.deadline ? new Date(item.deadline).toLocaleDateString('zh-CN') : '-' }}
        </template>
        <template #[`item.participantCount`]="{ item }">{{ formatCount(item.participantCount) }}</template>
        <template #[`item.pendingParticipantApprovalCount`]="{ item }">{{
          formatCount(item.pendingParticipantApprovalCount)
        }}</template>
        <template #[`item.pendingReviewCount`]="{ item }">{{ formatCount(item.pendingReviewCount) }}</template>
        <template #[`item.submissionConversionRate`]="{ item }">{{
          formatPercent(item.submissionConversionRate)
        }}</template>
        <template #[`item.successRate`]="{ item }">{{ formatPercent(item.successRate) }}</template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { SpaceAnalyticsTask } from '@/network/api/spaces/types'

import { ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'

import AnalyticsExportButton from './components/AnalyticsExportButton.vue'
import AnalyticsPublisherSelect from './components/AnalyticsPublisherSelect.vue'
import { useSpaceAnalyticsFilters } from './composables/useSpaceAnalyticsFilters'
import { formatCount, formatPercent } from './helpers'
import { buildAnalyticsApiParams } from './utils'

import { SpacesApi } from '@/network/api/spaces'

const { filters, replaceFilters, spaceId } = useSpaceAnalyticsFilters()

const loading = ref(false)
const tasks = ref<SpaceAnalyticsTask[]>([])
const publisherIdModel = ref<number | null>(filters.value.publisherId ?? null)
const sortByModel = ref(filters.value.sortBy || 'createdAt')
const sortOrderModel = ref(filters.value.sortOrder || 'desc')
const hasPendingApprovalModel = ref(Boolean(filters.value.hasPendingApproval))
const hasPendingReviewModel = ref(Boolean(filters.value.hasPendingReview))

watch(filters, (value) => {
  publisherIdModel.value = value.publisherId ?? null
  sortByModel.value = value.sortBy || 'createdAt'
  sortOrderModel.value = value.sortOrder || 'desc'
  hasPendingApprovalModel.value = Boolean(value.hasPendingApproval)
  hasPendingReviewModel.value = Boolean(value.hasPendingReview)
})

watch([publisherIdModel, sortByModel, sortOrderModel], async () => {
  await replaceFilters({
    publisherId: publisherIdModel.value ?? undefined,
    sortBy: sortByModel.value,
    sortOrder: sortOrderModel.value,
  })
})

const togglePendingApproval = async () => {
  hasPendingApprovalModel.value = !hasPendingApprovalModel.value
  await replaceFilters({
    hasPendingApproval: hasPendingApprovalModel.value || undefined,
  })
}

const togglePendingReview = async () => {
  hasPendingReviewModel.value = !hasPendingReviewModel.value
  await replaceFilters({
    hasPendingReview: hasPendingReviewModel.value || undefined,
  })
}

const load = async () => {
  loading.value = true
  try {
    const { data } = await SpacesApi.getAnalyticsTasks(spaceId.value, buildAnalyticsApiParams('tasks', filters.value))
    tasks.value = data.tasks
  } catch (error) {
    console.error('load analytics tasks failed', error)
    toast.error('加载题目分析失败')
  } finally {
    loading.value = false
  }
}

watch(
  filters,
  () => {
    load().catch(() => undefined)
  },
  { immediate: true }
)

const sortByItems = [
  { title: '创建时间', value: 'createdAt' },
  { title: '报名主体数', value: 'participantCount' },
  { title: '成功率', value: 'successRate' },
  { title: '待评审数', value: 'pendingReviewCount' },
]

const sortOrderItems = [
  { title: '降序', value: 'desc' },
  { title: '升序', value: 'asc' },
]

const headers = [
  { title: '题目', key: 'taskName', value: 'taskName' },
  { title: '老师', key: 'publisher', value: 'publisher', align: 'center' as const },
  { title: '分类', key: 'category', value: 'category', align: 'center' as const },
  { title: '审批状态', key: 'approved', value: 'approved', align: 'center' as const },
  { title: '创建时间', key: 'createdAt', value: 'createdAt', align: 'center' as const },
  { title: '截止时间', key: 'deadline', value: 'deadline', align: 'center' as const },
  { title: '报名主体', key: 'participantCount', value: 'participantCount', align: 'center' as const },
  {
    title: '待审核报名',
    key: 'pendingParticipantApprovalCount',
    value: 'pendingParticipantApprovalCount',
    align: 'center' as const,
  },
  { title: '待评审', key: 'pendingReviewCount', value: 'pendingReviewCount', align: 'center' as const },
  { title: '提交转化率', key: 'submissionConversionRate', value: 'submissionConversionRate', align: 'center' as const },
  { title: '成功率', key: 'successRate', value: 'successRate', align: 'center' as const },
]

const approvalText = (value: string) => {
  if (value === 'APPROVED') return '已通过'
  if (value === 'DISAPPROVED') return '未通过'
  return '待审核'
}

const approvalColor = (value: string) => {
  if (value === 'APPROVED') return 'success'
  if (value === 'DISAPPROVED') return 'error'
  return 'warning'
}
</script>

<style scoped lang="scss">
.section-toolbar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.section-toolbar__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.toolbar-card,
.table-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.toolbar-card {
  padding: 18px;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.toolbar-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

@media (max-width: 960px) {
  .section-toolbar {
    flex-direction: column;
  }

  .toolbar-grid {
    grid-template-columns: 1fr;
  }
}
</style>
