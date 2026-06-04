<template>
  <v-card flat rounded="lg" class="trend-card">
    <div class="trend-card__header">
      <div>
        <h3>{{ title }}</h3>
      </div>
      <div class="trend-card__summary">{{ total }} / {{ pointCount }} 个时间点</div>
    </div>

    <div v-if="pointCount" class="trend-card__chart">
      <svg viewBox="0 0 420 180" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(25,118,210,0.34)" />
            <stop offset="100%" stop-color="rgba(25,118,210,0.02)" />
          </linearGradient>
        </defs>
        <polyline class="trend-line trend-line--area" :points="areaPath" />
        <polyline class="trend-line trend-line--stroke" :points="linePath" />
      </svg>
      <div class="trend-card__footer">
        <span>{{ firstLabel }}</span>
        <span>{{ lastLabel }}</span>
      </div>
    </div>

    <v-empty-state
      v-else
      icon="mdi-chart-timeline-variant"
      title="暂无趋势数据"
      text="当前筛选范围内没有趋势点可展示。"
    />
  </v-card>
</template>

<script setup lang="ts">
import type { AnalyticsTimeSeriesPoint } from '@/network/api/spaces/types'

import { computed } from 'vue'

const props = defineProps<{
  title: string
  points?: AnalyticsTimeSeriesPoint[] | null
}>()

const normalizedPoints = computed(() => props.points || [])
const pointCount = computed(() => normalizedPoints.value.length)
const total = computed(() => normalizedPoints.value.reduce((sum, point) => sum + point.count, 0))

const projectedPoints = computed(() => {
  const points = normalizedPoints.value
  if (!points.length) return []

  const max = Math.max(...points.map((point) => point.count), 1)
  return points.map((point, index) => {
    const x = points.length === 1 ? 210 : (index / (points.length - 1)) * 400 + 10
    const y = 150 - (point.count / max) * 120
    return { x, y, point }
  })
})

const linePath = computed(() => projectedPoints.value.map(({ x, y }) => `${x},${y}`).join(' '))
const areaPath = computed(() => {
  if (!projectedPoints.value.length) return ''
  const head = projectedPoints.value[0]
  const tail = projectedPoints.value.at(-1)
  return `10,160 ${projectedPoints.value.map(({ x, y }) => `${x},${y}`).join(' ')} ${tail?.x ?? 410},160 ${head.x},160`
})

const firstLabel = computed(() => {
  const point = normalizedPoints.value[0]
  return point ? new Date(point.bucket).toLocaleDateString('zh-CN') : ''
})
const lastLabel = computed(() => {
  const point = normalizedPoints.value.at(-1)
  return point ? new Date(point.bucket).toLocaleDateString('zh-CN') : ''
})
</script>

<style scoped lang="scss">
.trend-card {
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgba(var(--v-theme-surface), 1);
}

.trend-card__header {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.trend-card__summary {
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-size: 0.82rem;
}

.trend-card__chart svg {
  width: 100%;
  height: 180px;
}

.trend-line {
  fill: none;
}

.trend-line--area {
  fill: rgba(var(--v-theme-primary), 0.08);
}

.trend-line--stroke {
  stroke: rgba(var(--v-theme-primary), 0.95);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trend-card__footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: rgba(var(--v-theme-on-surface), 0.56);
  font-size: 0.82rem;
}
</style>
