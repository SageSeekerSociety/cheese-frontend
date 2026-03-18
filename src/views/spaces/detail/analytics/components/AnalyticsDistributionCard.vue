<template>
  <v-card flat rounded="lg" class="distribution-card">
    <div class="section-heading">
      <div>
        <h3>{{ title }}</h3>
      </div>
    </div>

    <div v-if="rows.length" class="distribution-list">
      <div v-for="row in rows" :key="row.label" class="distribution-row">
        <div class="distribution-row__meta">
          <span class="distribution-row__label">{{ row.label }}</span>
          <span class="distribution-row__value">{{ row.count }} · {{ row.percentText }}</span>
        </div>
        <div class="distribution-row__track">
          <div class="distribution-row__fill" :style="{ width: `${row.percent}%` }"></div>
        </div>
      </div>
    </div>

    <v-empty-state v-else icon="mdi-chart-donut" title="暂无分布数据" text="当前筛选范围内暂无可展示的数据。" />
  </v-card>
</template>

<script setup lang="ts">
import type { AnalyticsDistribution } from '@/network/api/spaces/types'

import { computed } from 'vue'

const props = defineProps<{
  title: string
  distribution?: AnalyticsDistribution | null
}>()

const rows = computed(() => {
  const items = props.distribution?.items || []
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return items
    .map((item) => {
      const percent =
        item.percentage != null
          ? Number(item.percentage) * (item.percentage <= 1 ? 100 : 1)
          : total > 0
            ? (item.count / total) * 100
            : 0
      return {
        label: item.label,
        count: item.count,
        percent,
        percentText: `${percent.toFixed(1)}%`,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
})
</script>

<style scoped lang="scss">
.distribution-card {
  height: 100%;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgba(var(--v-theme-surface), 1);
}

.section-heading {
  margin-bottom: 16px;
}

h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.distribution-row__meta {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 7px;
}

.distribution-row__label {
  font-weight: 600;
}

.distribution-row__value {
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-size: 0.9rem;
}

.distribution-row__track {
  overflow: hidden;
  height: 10px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.distribution-row__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.45), rgba(var(--v-theme-primary), 0.95));
}
</style>
