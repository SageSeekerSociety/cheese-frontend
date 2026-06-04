<template>
  <div class="analytics-section">
    <div class="section-toolbar">
      <div>
        <h2 class="section-toolbar__title">参与者分析</h2>
      </div>

      <AnalyticsExportButton section="participants" :space-id="spaceId" :filters="filters" label="导出参与者明细" />
    </div>

    <v-card flat rounded="lg" class="toolbar-card">
      <div class="toolbar-grid">
        <AnalyticsPublisherSelect v-model="publisherIdModel" :space-id="spaceId" :filters="filters" />
        <v-select
          v-model="participationApprovedModel"
          :items="participationItems"
          label="报名审批状态"
          density="comfortable"
          hide-details
          variant="outlined"
          clearable
        />
        <v-select
          v-model="completionStatusModel"
          :items="completionItems"
          label="完成状态"
          density="comfortable"
          hide-details
          variant="outlined"
          clearable
        />
        <v-select
          v-model="realNameModel"
          :items="realNameItems"
          label="实名状态"
          density="comfortable"
          hide-details
          variant="outlined"
        />
        <v-select
          v-model="groupByModel"
          :items="groupByItems"
          label="趋势粒度"
          density="comfortable"
          hide-details
          variant="outlined"
        />
      </div>
    </v-card>

    <v-progress-linear v-if="loading && !participants" indeterminate color="primary" class="mt-4" />

    <v-row v-if="participants" class="mt-1">
      <v-col cols="12" md="6" lg="3">
        <AnalyticsMetricCard
          label="报名主体数"
          :value="formatCount(participants.entityMetrics.participantCount)"
          description="个人和团队都按主体计算"
          icon="mdi-account-group-outline"
        />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <AnalyticsMetricCard
          label="审核通过报名"
          :value="formatCount(participants.entityMetrics.approvedParticipantCount)"
          description="审核通过的报名主体"
          icon="mdi-account-check-outline"
          tone="success"
        />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <AnalyticsMetricCard
          label="成功主体数"
          :value="formatCount(participants.entityMetrics.successfulParticipantCount)"
          description="完成状态为成功的主体"
          icon="mdi-trophy-outline"
          tone="warning"
        />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <AnalyticsMetricCard
          label="实名学生数"
          :value="formatCount(participants.studentMetrics.studentsWithRealNameCount)"
          description="已实名的真实学生"
          icon="mdi-card-account-details-outline"
          tone="info"
        />
      </v-col>
    </v-row>

    <v-row v-if="participants" class="mt-1">
      <v-col cols="12" lg="4">
        <AnalyticsTrendCard title="报名趋势" :points="participants.trends.participantsJoined" />
      </v-col>
      <v-col cols="12" lg="4">
        <AnalyticsTrendCard title="提交趋势" :points="participants.trends.submissionsCreated" />
      </v-col>
      <v-col cols="12" lg="4">
        <AnalyticsTrendCard title="成功趋势" :points="participants.trends.successesAchieved" />
      </v-col>
    </v-row>

    <v-row v-if="participants" class="mt-1">
      <v-col cols="12" md="6" xl="4">
        <AnalyticsDistributionCard title="报名审批状态" :distribution="approvalDistribution" />
      </v-col>
      <v-col cols="12" md="6" xl="4">
        <AnalyticsDistributionCard title="完成状态分布" :distribution="completionDistribution" />
      </v-col>
      <v-col cols="12" md="6" xl="4">
        <AnalyticsDistributionCard title="实名状态分布" :distribution="realNameDistribution" />
      </v-col>
      <v-col cols="12" md="6" xl="4">
        <AnalyticsDistributionCard title="年级分布" :distribution="gradeDistribution" />
      </v-col>
      <v-col cols="12" md="6" xl="4">
        <AnalyticsDistributionCard title="专业分布" :distribution="majorDistribution" />
      </v-col>
      <v-col cols="12" md="6" xl="4">
        <AnalyticsDistributionCard title="班级分布" :distribution="classDistribution" />
      </v-col>
    </v-row>

    <v-empty-state
      v-else-if="!loading"
      icon="mdi-account-search-outline"
      title="暂无参与者分析数据"
      text="当前筛选范围下暂无参与者统计结果。"
    />
  </div>
</template>

<script setup lang="ts">
import type { SpaceAnalyticsParticipants } from '@/network/api/spaces/types'
import type { AnalyticsGroupBy, AnalyticsRealNameFilter } from './utils'

import { computed, ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'

import AnalyticsDistributionCard from './components/AnalyticsDistributionCard.vue'
import AnalyticsExportButton from './components/AnalyticsExportButton.vue'
import AnalyticsMetricCard from './components/AnalyticsMetricCard.vue'
import AnalyticsPublisherSelect from './components/AnalyticsPublisherSelect.vue'
import AnalyticsTrendCard from './components/AnalyticsTrendCard.vue'
import { useSpaceAnalyticsFilters } from './composables/useSpaceAnalyticsFilters'
import { formatCount, withDistributionPercent } from './helpers'
import { buildAnalyticsApiParams } from './utils'

import { SpacesApi } from '@/network/api/spaces'

const { filters, replaceFilters, spaceId } = useSpaceAnalyticsFilters()

const loading = ref(false)
const participants = ref<SpaceAnalyticsParticipants | null>(null)
const publisherIdModel = ref<number | null>(filters.value.publisherId ?? null)
const participationApprovedModel = ref(filters.value.participationApproved)
const completionStatusModel = ref(filters.value.completionStatus)
const realNameModel = ref<AnalyticsRealNameFilter>(filters.value.realName)
const groupByModel = ref<AnalyticsGroupBy>(filters.value.groupBy)

watch(filters, (value) => {
  publisherIdModel.value = value.publisherId ?? null
  participationApprovedModel.value = value.participationApproved
  completionStatusModel.value = value.completionStatus
  realNameModel.value = value.realName
  groupByModel.value = value.groupBy
})

watch([publisherIdModel, participationApprovedModel, completionStatusModel, realNameModel, groupByModel], async () => {
  await replaceFilters({
    publisherId: publisherIdModel.value ?? undefined,
    participationApproved: participationApprovedModel.value || undefined,
    completionStatus: completionStatusModel.value || undefined,
    realName: realNameModel.value,
    groupBy: groupByModel.value,
  })
})

const load = async () => {
  loading.value = true
  try {
    const { data } = await SpacesApi.getAnalyticsParticipants(
      spaceId.value,
      buildAnalyticsApiParams('participants', filters.value)
    )
    participants.value = data
  } catch (error) {
    console.error('load analytics participants failed', error)
    toast.error('加载参与者分析失败')
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

const participationItems = [
  { title: '待审核', value: 'NONE' },
  { title: '已通过', value: 'APPROVED' },
  { title: '未通过', value: 'DISAPPROVED' },
]

const completionItems = [
  { title: '未提交', value: 'NOT_SUBMITTED' },
  { title: '待评审', value: 'PENDING_REVIEW' },
  { title: '可重提', value: 'REJECTED_RESUBMITTABLE' },
  { title: '失败', value: 'FAILED' },
  { title: '成功', value: 'SUCCESS' },
]

const realNameItems = [
  { title: '全部', value: 'all' },
  { title: '已实名', value: 'with' },
  { title: '未实名', value: 'without' },
]

const groupByItems = [
  { title: '按日', value: 'day' },
  { title: '按周', value: 'week' },
  { title: '按月', value: 'month' },
]

const approvalDistribution = computed(() =>
  participants.value
    ? {
        ...participants.value.distributions.byApprovalStatus,
        items: withDistributionPercent(participants.value.distributions.byApprovalStatus),
      }
    : null
)

const completionDistribution = computed(() =>
  participants.value
    ? {
        ...participants.value.distributions.byCompletionStatus,
        items: withDistributionPercent(participants.value.distributions.byCompletionStatus),
      }
    : null
)

const realNameDistribution = computed(() =>
  participants.value
    ? {
        ...participants.value.distributions.byRealNameStatus,
        items: withDistributionPercent(participants.value.distributions.byRealNameStatus),
      }
    : null
)

const gradeDistribution = computed(() =>
  participants.value
    ? {
        ...participants.value.distributions.byGrade,
        items: withDistributionPercent(participants.value.distributions.byGrade),
      }
    : null
)

const majorDistribution = computed(() =>
  participants.value
    ? {
        ...participants.value.distributions.byMajor,
        items: withDistributionPercent(participants.value.distributions.byMajor),
      }
    : null
)

const classDistribution = computed(() =>
  participants.value
    ? {
        ...participants.value.distributions.byClassName,
        items: withDistributionPercent(participants.value.distributions.byClassName),
      }
    : null
)
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

.toolbar-card {
  padding: 18px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgba(var(--v-theme-surface), 1);
}

.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 1264px) {
  .toolbar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
