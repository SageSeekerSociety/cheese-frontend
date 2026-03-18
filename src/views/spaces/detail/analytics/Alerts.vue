<template>
  <div class="analytics-section">
    <div class="section-toolbar">
      <div>
        <h2 class="section-toolbar__title">治理告警</h2>
      </div>
    </div>

    <v-progress-linear v-if="loading && !alerts" indeterminate color="primary" class="mb-4" />

    <div v-if="alerts" class="alerts-grid">
      <v-card
        v-for="item in alertCards"
        :key="item.label"
        flat
        rounded="lg"
        class="alert-card"
        @click="item.action && item.action()"
      >
        <div class="alert-card__meta">
          <span class="alert-card__label">{{ item.label }}</span>
          <v-icon color="warning">mdi-arrow-top-right</v-icon>
        </div>
        <div class="alert-card__value">{{ item.value }}</div>
        <div class="alert-card__hint">{{ item.hint }}</div>
      </v-card>
    </div>

    <v-empty-state
      v-else-if="!loading"
      icon="mdi-bell-off-outline"
      title="暂无告警"
      text="当前空间在这一时间窗口内没有需要关注的治理告警。"
    />
  </div>
</template>

<script setup lang="ts">
import type { SpaceAnalyticsAlerts } from '@/network/api/spaces/types'

import { computed, ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'

import { useSpaceAnalyticsFilters } from './composables/useSpaceAnalyticsFilters'
import { formatCount } from './helpers'

import { SpacesApi } from '@/network/api/spaces'

const { pushToSection, spaceId } = useSpaceAnalyticsFilters()

const loading = ref(false)
const alerts = ref<SpaceAnalyticsAlerts | null>(null)

const load = async () => {
  loading.value = true
  try {
    const { data } = await SpacesApi.getAnalyticsAlerts(spaceId.value)
    alerts.value = data
  } catch (error) {
    console.error('load analytics alerts failed', error)
    toast.error('加载治理告警失败')
  } finally {
    loading.value = false
  }
}

watch(
  spaceId,
  () => {
    load().catch(() => undefined)
  },
  { immediate: true }
)

const alertCards = computed(() => [
  {
    label: '待审核题目',
    value: formatCount(alerts.value?.pendingTaskApprovalCount),
    hint: '跳转后自动切到题目页并筛选待审核题目',
    action: () => pushToSection('SpacesDetailAnalyticsTasks', { taskApproved: 'NONE' }),
  },
  {
    label: '待审核报名',
    value: formatCount(alerts.value?.pendingParticipantApprovalCount),
    hint: '跳转后自动筛选待审核报名',
    action: () => pushToSection('SpacesDetailAnalyticsTasks', { hasPendingApproval: true }),
  },
  {
    label: '待评审提交',
    value: formatCount(alerts.value?.pendingSubmissionReviewCount),
    hint: '跳转后自动筛选待评审提交',
    action: () => pushToSection('SpacesDetailAnalyticsTasks', { hasPendingReview: true }),
  },
  {
    label: '停滞题目',
    value: formatCount(alerts.value?.stalledTaskCount),
    hint: '后端阈值：14 天已有人报名但无提交',
  },
  {
    label: '超时未评审提交',
    value: formatCount(alerts.value?.overdueUnreviewedSubmissionCount),
    hint: '后端阈值：7 天',
  },
  {
    label: '长期不活跃老师',
    value: formatCount(alerts.value?.inactivePublisherCount),
    hint: '后端阈值：30 天',
  },
])
</script>

<style scoped lang="scss">
.analytics-section {
  display: flex;
  flex-direction: column;
}

.section-toolbar {
  margin-bottom: 18px;
}

.section-toolbar__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.alerts-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.alert-card {
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgba(var(--v-theme-surface), 1);
  cursor: pointer;
}

.alert-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-card__label {
  color: rgba(var(--v-theme-on-surface), 0.58);
}

.alert-card__value {
  margin: 12px 0 8px;
  font-size: 1.75rem;
  font-weight: 700;
}

.alert-card__hint {
  color: rgba(var(--v-theme-on-surface), 0.56);
  font-size: 0.9rem;
}

@media (max-width: 960px) {
  .alerts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
