<template>
  <div class="analytics-section">
    <div class="section-toolbar">
      <div>
        <h2 class="section-toolbar__title">老师分析</h2>
      </div>

      <div class="section-toolbar__actions">
        <v-select
          v-model="sortByModel"
          :items="sortByItems"
          label="排序字段"
          density="comfortable"
          hide-details
          variant="outlined"
          class="sort-field"
        />
        <v-select
          v-model="sortOrderModel"
          :items="sortOrderItems"
          label="排序方向"
          density="comfortable"
          hide-details
          variant="outlined"
          class="sort-field"
        />
        <AnalyticsExportButton section="publishers" :space-id="spaceId" :filters="filters" label="导出老师视图" />
      </div>
    </div>

    <div v-if="rankings.length" class="ranking-strip">
      <v-card v-for="item in rankings" :key="item.title" flat rounded="lg" class="ranking-card">
        <div class="ranking-card__title">{{ item.title }}</div>
        <div class="ranking-card__name">{{ item.name }}</div>
        <div class="ranking-card__meta">{{ item.meta }}</div>
      </v-card>
    </div>

    <v-card flat rounded="xl" class="table-card mt-4">
      <v-data-table :headers="headers" :items="publishers" :loading="loading" density="comfortable" items-per-page="10">
        <template #[`item.taskCount`]="{ item }">{{ formatCount(item.taskCount) }}</template>
        <template #[`item.participantCount`]="{ item }">{{ formatCount(item.participantCount) }}</template>
        <template #[`item.avgParticipantsPerTask`]="{ item }">{{ item.avgParticipantsPerTask.toFixed(1) }}</template>
        <template #[`item.submissionConversionRate`]="{ item }">{{
          formatPercent(item.submissionConversionRate)
        }}</template>
        <template #[`item.successRate`]="{ item }">{{ formatPercent(item.successRate) }}</template>
        <template #[`item.lastTaskCreatedAt`]="{ item }">
          {{ item.lastTaskCreatedAt ? new Date(item.lastTaskCreatedAt).toLocaleDateString('zh-CN') : '-' }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { SpaceAnalyticsPublisherMetrics } from '@/network/api/spaces/types'

import { computed, ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'

import AnalyticsExportButton from './components/AnalyticsExportButton.vue'
import { useSpaceAnalyticsFilters } from './composables/useSpaceAnalyticsFilters'
import { formatCount, formatPercent } from './helpers'
import { buildAnalyticsApiParams } from './utils'

import { SpacesApi } from '@/network/api/spaces'

const { filters, replaceFilters, spaceId } = useSpaceAnalyticsFilters()

const loading = ref(false)
const publishers = ref<SpaceAnalyticsPublisherMetrics[]>([])
const sortByModel = ref(filters.value.sortBy || 'taskCount')
const sortOrderModel = ref(filters.value.sortOrder || 'desc')

watch(filters, (value) => {
  sortByModel.value = value.sortBy || 'taskCount'
  sortOrderModel.value = value.sortOrder || 'desc'
})

watch([sortByModel, sortOrderModel], async () => {
  await replaceFilters({
    sortBy: sortByModel.value,
    sortOrder: sortOrderModel.value,
  })
})

const load = async () => {
  loading.value = true
  try {
    const { data } = await SpacesApi.getAnalyticsPublishers(
      spaceId.value,
      buildAnalyticsApiParams('publishers', filters.value)
    )
    publishers.value = data.publishers
  } catch (error) {
    console.error('load analytics publishers failed', error)
    toast.error('加载老师分析失败')
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

const headers = [
  { title: '老师', key: 'publisherName', value: 'publisherName' },
  { title: '题目数', key: 'taskCount', value: 'taskCount', align: 'center' as const },
  { title: '报名主体', key: 'participantCount', value: 'participantCount', align: 'center' as const },
  {
    title: '审核通过报名',
    key: 'approvedParticipantCount',
    value: 'approvedParticipantCount',
    align: 'center' as const,
  },
  { title: '提交主体', key: 'submittedParticipantCount', value: 'submittedParticipantCount', align: 'center' as const },
  {
    title: '成功主体',
    key: 'successfulParticipantCount',
    value: 'successfulParticipantCount',
    align: 'center' as const,
  },
  { title: '平均每题报名', key: 'avgParticipantsPerTask', value: 'avgParticipantsPerTask', align: 'center' as const },
  { title: '提交转化率', key: 'submissionConversionRate', value: 'submissionConversionRate', align: 'center' as const },
  { title: '成功率', key: 'successRate', value: 'successRate', align: 'center' as const },
  { title: '最近发题', key: 'lastTaskCreatedAt', value: 'lastTaskCreatedAt', align: 'center' as const },
]

const sortByItems = [
  { title: '题目数', value: 'taskCount' },
  { title: '报名主体数', value: 'participantCount' },
  { title: '成功率', value: 'successRate' },
  { title: '最近发题时间', value: 'lastTaskCreatedAt' },
]

const sortOrderItems = [
  { title: '降序', value: 'desc' },
  { title: '升序', value: 'asc' },
]

const rankings = computed(() => {
  if (!publishers.value.length) return []
  const byTask = [...publishers.value].sort((a, b) => b.taskCount - a.taskCount)[0]
  const byRate = [...publishers.value].sort((a, b) => b.successRate - a.successRate)[0]
  const byParticipant = [...publishers.value].sort((a, b) => b.participantCount - a.participantCount)[0]

  return [
    {
      title: '最活跃老师',
      name: byTask?.publisherName || '-',
      meta: `${formatCount(byTask?.taskCount)} 个题目`,
    },
    {
      title: '最高成功率',
      name: byRate?.publisherName || '-',
      meta: formatPercent(byRate?.successRate),
    },
    {
      title: '最强吸引力',
      name: byParticipant?.publisherName || '-',
      meta: `${formatCount(byParticipant?.participantCount)} 个报名主体`,
    },
  ]
})
</script>

<style scoped lang="scss">
.analytics-section {
  display: flex;
  flex-direction: column;
}

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

.section-toolbar__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.sort-field {
  min-width: 160px;
}

.ranking-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.ranking-card,
.table-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.ranking-card {
  padding: 16px;
  background-color: rgba(var(--v-theme-surface), 1);
}

.ranking-card__title {
  color: rgba(var(--v-theme-on-surface), 0.56);
  margin-bottom: 12px;
}

.ranking-card__name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.ranking-card__meta {
  color: rgba(var(--v-theme-on-surface), 0.56);
}

.table-card {
  overflow: hidden;
}

@media (max-width: 960px) {
  .section-toolbar {
    flex-direction: column;
  }

  .ranking-strip {
    grid-template-columns: 1fr;
  }
}
</style>
