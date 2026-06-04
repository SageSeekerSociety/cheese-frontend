<template>
  <div class="analytics-section">
    <div class="section-toolbar">
      <div>
        <h2 class="section-toolbar__title">总览</h2>
      </div>

      <div class="section-toolbar__controls">
        <AnalyticsPublisherSelect
          v-model="publisherIdModel"
          :space-id="spaceId"
          :filters="filters"
          class="control-field"
        />
        <v-select
          v-model="groupByModel"
          :items="groupByItems"
          label="趋势粒度"
          density="comfortable"
          hide-details
          variant="outlined"
          class="control-field"
        />
      </div>
    </div>

    <v-progress-linear v-if="loading && !overview" indeterminate color="primary" class="mb-4" />

    <template v-if="overview">
      <v-row>
        <v-col v-for="item in metricCards" :key="item.label" cols="12" md="6" lg="4" xl="2">
          <AnalyticsMetricCard v-bind="item" />
        </v-col>
      </v-row>

      <v-row class="mt-1">
        <v-col cols="12" lg="8">
          <AnalyticsTrendCard title="报名主体趋势" :points="overview.trends.participantsJoined" />
        </v-col>
        <v-col cols="12" lg="4">
          <AnalyticsTrendCard title="成功趋势" :points="overview.trends.successesAchieved" />
        </v-col>
      </v-row>

      <v-row class="mt-1">
        <v-col cols="12" md="4">
          <AnalyticsDistributionCard title="题目分类分布" :distribution="categoryDistribution" />
        </v-col>
        <v-col cols="12" md="4">
          <AnalyticsDistributionCard title="题目审批状态" :distribution="approvalDistribution" />
        </v-col>
        <v-col cols="12" md="4">
          <AnalyticsDistributionCard title="参与完成状态" :distribution="completionDistribution" />
        </v-col>
      </v-row>

      <v-card flat rounded="lg" class="pulse-card mt-4">
        <div class="section-toolbar compact">
          <div>
            <h3 class="pulse-card__title">治理提醒</h3>
          </div>
        </div>

        <div class="pulse-grid">
          <button
            v-for="item in pulseItems"
            :key="item.label"
            type="button"
            class="pulse-item"
            @click="item.action && item.action()"
          >
            <div class="pulse-item__label">{{ item.label }}</div>
            <div class="pulse-item__value">{{ item.value }}</div>
            <div class="pulse-item__hint">{{ item.hint }}</div>
          </button>
        </div>
      </v-card>
    </template>

    <v-empty-state
      v-else-if="!loading"
      icon="mdi-chart-areaspline"
      title="暂无概览数据"
      text="当前筛选范围下还没有可展示的空间统计结果。"
    />
  </div>
</template>

<script setup lang="ts">
import type { SpaceAnalyticsAlerts, SpaceAnalyticsOverview } from '@/network/api/spaces/types'
import type { AnalyticsGroupBy } from './utils'

import { computed, ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'

import AnalyticsDistributionCard from './components/AnalyticsDistributionCard.vue'
import AnalyticsMetricCard from './components/AnalyticsMetricCard.vue'
import AnalyticsPublisherSelect from './components/AnalyticsPublisherSelect.vue'
import AnalyticsTrendCard from './components/AnalyticsTrendCard.vue'
import { useSpaceAnalyticsFilters } from './composables/useSpaceAnalyticsFilters'
import { formatCount, formatPercent, withDistributionPercent } from './helpers'
import { buildAnalyticsApiParams } from './utils'

import { SpacesApi } from '@/network/api/spaces'

const { filters, pushToSection, replaceFilters, spaceId } = useSpaceAnalyticsFilters()

const loading = ref(false)
const overview = ref<SpaceAnalyticsOverview | null>(null)
const alerts = ref<SpaceAnalyticsAlerts | null>(null)
const publisherIdModel = ref<number | null>(filters.value.publisherId ?? null)
const groupByModel = ref<AnalyticsGroupBy>(filters.value.groupBy)

const groupByItems = [
  { title: '按日', value: 'day' },
  { title: '按周', value: 'week' },
  { title: '按月', value: 'month' },
]

watch(
  filters,
  (value) => {
    publisherIdModel.value = value.publisherId ?? null
    groupByModel.value = value.groupBy
  },
  { immediate: true }
)

watch([publisherIdModel, groupByModel], async () => {
  await replaceFilters({
    publisherId: publisherIdModel.value ?? undefined,
    groupBy: groupByModel.value,
  })
})

const load = async () => {
  loading.value = true
  try {
    const [overviewResponse, alertsResponse] = await Promise.all([
      SpacesApi.getAnalyticsOverview(spaceId.value, buildAnalyticsApiParams('overview', filters.value)),
      SpacesApi.getAnalyticsAlerts(spaceId.value),
    ])

    overview.value = overviewResponse.data
    alerts.value = alertsResponse.data
  } catch (error) {
    console.error('load overview analytics failed', error)
    toast.error('加载统计总览失败')
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

const metricCards = computed(() => {
  if (!overview.value) return []

  return [
    {
      label: '题目总数',
      value: formatCount(overview.value.entityMetrics.taskCount),
      description: '纳入统计的题目量',
      icon: 'mdi-clipboard-text-outline',
    },
    {
      label: '发题老师数',
      value: formatCount(overview.value.entityMetrics.publisherCount),
      description: '产生过有效题目的老师',
      icon: 'mdi-account-tie-outline',
      tone: 'info' as const,
    },
    {
      label: '报名主体数',
      value: formatCount(overview.value.entityMetrics.participantCount),
      description: '个人或团队都按一个主体计算',
      icon: 'mdi-account-group-outline',
      tone: 'primary' as const,
    },
    {
      label: '提交主体数',
      value: formatCount(overview.value.entityMetrics.submittedParticipantCount),
      description: `提交转化率 ${formatPercent(overview.value.entityMetrics.submissionConversionRate)}`,
      icon: 'mdi-tray-arrow-up',
      tone: 'warning' as const,
    },
    {
      label: '成功主体数',
      value: formatCount(overview.value.entityMetrics.successfulParticipantCount),
      description: `成功率 ${formatPercent(overview.value.entityMetrics.successRate)}`,
      icon: 'mdi-trophy-outline',
      tone: 'success' as const,
    },
    {
      label: '真实学生人数',
      value: formatCount(overview.value.studentMetrics.studentCount),
      description: '团队按成员快照展开',
      icon: 'mdi-school-outline',
      tone: 'info' as const,
    },
  ]
})

const categoryDistribution = computed(() =>
  overview.value
    ? {
        ...overview.value.taskDistributions.byCategory,
        items: withDistributionPercent(overview.value.taskDistributions.byCategory),
      }
    : null
)

const approvalDistribution = computed(() =>
  overview.value
    ? {
        ...overview.value.taskDistributions.byApprovalStatus,
        items: withDistributionPercent(overview.value.taskDistributions.byApprovalStatus),
      }
    : null
)

const completionDistribution = computed(() =>
  overview.value
    ? {
        ...overview.value.taskDistributions.byCompletionStatus,
        items: withDistributionPercent(overview.value.taskDistributions.byCompletionStatus),
      }
    : null
)

const pulseItems = computed(() => [
  {
    label: '待审核题目',
    value: formatCount(alerts.value?.pendingTaskApprovalCount),
    hint: '跳转到题目页',
    action: () => pushToSection('SpacesDetailAnalyticsTasks', { taskApproved: 'NONE' }),
  },
  {
    label: '待审核报名',
    value: formatCount(alerts.value?.pendingParticipantApprovalCount),
    hint: '带入待审核筛选',
    action: () => pushToSection('SpacesDetailAnalyticsTasks', { hasPendingApproval: true }),
  },
  {
    label: '待评审提交',
    value: formatCount(alerts.value?.pendingSubmissionReviewCount),
    hint: '带入待评审筛选',
    action: () => pushToSection('SpacesDetailAnalyticsTasks', { hasPendingReview: true }),
  },
  {
    label: '停滞题目',
    value: formatCount(alerts.value?.stalledTaskCount),
    hint: '阈值由后端固定为 14 天',
  },
  {
    label: '超时未评审',
    value: formatCount(alerts.value?.overdueUnreviewedSubmissionCount),
    hint: '阈值由后端固定为 7 天',
  },
  {
    label: '长期不活跃老师',
    value: formatCount(alerts.value?.inactivePublisherCount),
    hint: '阈值由后端固定为 30 天',
  },
])
</script>

<style scoped lang="scss">
.analytics-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.section-toolbar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  &.compact {
    margin-bottom: 16px;
  }
}

.section-toolbar__title,
.pulse-card__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.section-toolbar__controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  min-width: min(100%, 420px);
}

.control-field {
  min-width: 180px;
  flex: 1 1 180px;
}

.pulse-card {
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgba(var(--v-theme-surface), 1);
}

.pulse-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.pulse-item {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgba(var(--v-theme-surface), 1);
  text-align: left;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.02);
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
}

.pulse-item__label {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 10px;
}

.pulse-item__value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.pulse-item__hint {
  color: rgba(var(--v-theme-on-surface), 0.54);
  font-size: 0.88rem;
}

@media (max-width: 960px) {
  .section-toolbar {
    flex-direction: column;
  }

  .section-toolbar__controls {
    width: 100%;
    min-width: 0;
  }

  .pulse-grid {
    grid-template-columns: 1fr;
  }
}
</style>
