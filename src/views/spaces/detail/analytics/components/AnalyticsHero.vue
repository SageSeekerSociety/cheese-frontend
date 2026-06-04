<template>
  <div class="analytics-summary">
    <div>
      <div class="analytics-summary__title">{{ spaceName }}</div>
      <div class="analytics-summary__meta">{{ rangeLabel }}</div>
    </div>
    <v-chip size="small" variant="outlined">{{ approvalLabel }}</v-chip>
  </div>
</template>

<script setup lang="ts">
import type { SpaceAnalyticsQueryState } from '../utils'

import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useSpaceStore } from '@/stores/space'

const props = defineProps<{
  filters: SpaceAnalyticsQueryState
}>()

const spaceStore = useSpaceStore()
const { currentSpace } = storeToRefs(spaceStore)

const spaceName = computed(() => currentSpace.value?.name || '当前空间')
const rangeLabel = computed(() => `${props.filters.from} 至 ${props.filters.to}`)
const approvalLabel = computed(() => {
  if (props.filters.taskApproved === 'ALL') return '统计全部题目'
  if (props.filters.taskApproved === 'APPROVED') return '仅统计已通过题目'
  if (props.filters.taskApproved === 'DISAPPROVED') return '仅统计未通过题目'
  return '仅统计待审核题目'
})
</script>

<style scoped lang="scss">
.analytics-summary {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 4px 0 0;
}

.analytics-summary__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.92);
}

.analytics-summary__meta {
  margin-top: 6px;
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.58);
}

@media (max-width: 960px) {
  .analytics-summary {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
