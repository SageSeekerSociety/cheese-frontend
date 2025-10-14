<template>
  <v-card flat rounded="lg" class="border">
    <v-card-title class="pb-2">
      {{ title }}
    </v-card-title>
    <v-card-text>
      <div v-if="!data || data.length === 0" class="text-center py-8 text-medium-emphasis">暂无数据</div>
      <div v-else-if="chartType === 'pie'" class="pie-chart">
        <svg :width="size" :height="size" viewBox="0 0 200 200">
          <g transform="translate(100, 100)">
            <g
              v-for="(segment, index) in pieSegments"
              :key="index"
              :class="['pie-segment', { 'pie-segment-hover': hoveredSegment === index }]"
              @mouseenter="hoveredSegment = index"
              @mouseleave="hoveredSegment = null"
            >
              <path
                :d="segment.path"
                :fill="colors[index % colors.length]"
                :stroke="'white'"
                :stroke-width="2"
                :transform="hoveredSegment === index ? 'scale(1.05)' : 'scale(1)'"
                style="cursor: pointer; transition: transform 0.2s ease"
              />
              <title>{{ data[index].label }}: {{ data[index].count }} ({{ data[index].percentage.toFixed(1) }}%)</title>
            </g>
          </g>
        </svg>
      </div>

      <div v-else-if="chartType === 'bar'" class="bar-chart d-flex justify-center">
        <svg :width="400" :height="250" viewBox="0 0 400 250">
          <g transform="translate(50, 200)">
            <g v-for="(item, index) in data" :key="index">
              <rect
                :x="index * (300 / data.length) + 10"
                :y="-Math.max(item.count * 10, 20)"
                :width="Math.min(barWidth, 50)"
                :height="Math.max(item.count * 10, 20)"
                :fill="colors[index % colors.length]"
                :opacity="hoveredBar === index ? 1 : 0.8"
                :transform="hoveredBar === index ? `translate(0, -5)` : 'translate(0, 0)'"
                style="cursor: pointer; transition: all 0.2s ease"
                @mouseenter="hoveredBar = index"
                @mouseleave="hoveredBar = null"
              />
              <text
                :x="index * (300 / data.length) + 10 + Math.min(barWidth, 50) / 2"
                :y="15"
                text-anchor="middle"
                font-size="12"
                class="chart-label"
              >
                {{ item.label }}
              </text>
              <text
                :x="index * (300 / data.length) + 10 + Math.min(barWidth, 50) / 2"
                :y="-Math.max(item.count * 10, 20) - 5"
                text-anchor="middle"
                font-size="12"
                font-weight="bold"
                :fill="hoveredBar === index ? colors[index % colors.length] : '#666'"
              >
                {{ item.count }}
              </text>
              <title>{{ item.label }}: {{ item.count }}</title>
            </g>
            <!-- Y轴 -->
            <line x1="0" y1="0" x2="0" y2="-180" stroke="#ccc" stroke-width="1" />
            <!-- X轴 -->
            <line x1="0" y1="0" x2="320" y2="0" stroke="#ccc" stroke-width="1" />
          </g>
        </svg>
      </div>

      <div class="legend mt-4">
        <div v-for="(item, index) in data" :key="index" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: colors[index % colors.length] }" />
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.count }} ({{ item.percentage.toFixed(1) }}%)</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { AnalyticsDistributionItem } from '@/network/api/spaces/types'

import { computed, ref } from 'vue'

interface Props {
  title: string
  data: AnalyticsDistributionItem[]
  chartType: 'pie' | 'bar'
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
})

const hoveredSegment = ref<number | null>(null)

const colors = [
  '#1976D2',
  '#2E7D32',
  '#F57C00',
  '#8E24AA',
  '#D32F2F',
  '#00796B',
  '#5E35B1',
  '#689F38',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#E91E63',
  '#00BCD4',
  '#FF9800',
  '#9C27B0',
  '#4CAF50',
]

const barWidth = computed(() => {
  if (props.data.length === 0) return 60
  return Math.min(60, 320 / props.data.length)
})

const hoveredBar = ref<number | null>(null)

const pieSegments = computed(() => {
  if (props.chartType !== 'pie') return []

  let cumulativeAngle = 0
  return props.data.map((item) => {
    const angle = (item.percentage / 100) * 2 * Math.PI
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + angle

    const x1 = Math.cos(startAngle) * 80
    const y1 = Math.sin(startAngle) * 80
    const x2 = Math.cos(endAngle) * 80
    const y2 = Math.sin(endAngle) * 80

    const largeArcFlag = angle > Math.PI ? 1 : 0

    const path = ['M', 0, 0, 'L', x1, y1, 'A', 80, 80, 0, largeArcFlag, 1, x2, y2, 'Z'].join(' ')

    cumulativeAngle += angle

    return { path }
  })
})
</script>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.pie-chart,
.bar-chart {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-label {
  fill: rgba(var(--v-theme-on-surface), 0.87);
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.legend-value {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 500;
}
</style>
