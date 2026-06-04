<template>
  <v-card flat rounded="lg" class="analytics-filter-bar">
    <div class="analytics-filter-bar__quick mb-3">
      <v-btn
        v-for="preset in presets"
        :key="preset.key"
        size="small"
        rounded="lg"
        variant="outlined"
        @click="$emit('apply-preset', preset.key)"
      >
        {{ preset.label }}
      </v-btn>
    </div>

    <v-row class="ma-0" dense>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="model.from"
          type="date"
          label="开始日期"
          density="comfortable"
          hide-details
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="model.to"
          type="date"
          label="结束日期"
          density="comfortable"
          hide-details
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="model.categoryId"
          :items="categoryItems"
          label="分类"
          density="comfortable"
          hide-details
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="model.taskApproved"
          :items="approvalItems"
          label="题目审批状态"
          density="comfortable"
          hide-details
          variant="outlined"
        />
      </v-col>
    </v-row>

    <div class="analytics-filter-bar__actions">
      <div class="text-caption text-medium-emphasis">筛选会在各分区间保持一致</div>
      <div class="d-flex align-center gap-2">
        <v-btn variant="text" rounded="lg" @click="$emit('reset')">重置</v-btn>
        <v-btn color="primary" rounded="lg" variant="flat" @click="$emit('apply')">应用筛选</v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { SpaceAnalyticsQueryState } from '../utils'

const model = defineModel<SpaceAnalyticsQueryState>({ required: true })

defineProps<{
  categoryItems: Array<{ title: string; value: number | null }>
}>()

defineEmits<{
  (e: 'apply'): void
  (e: 'reset'): void
  (e: 'apply-preset', preset: '30d' | '180d' | 'all'): void
}>()

const approvalItems = [
  { title: '全部', value: 'ALL' },
  { title: '待审核', value: 'NONE' },
  { title: '仅已通过', value: 'APPROVED' },
  { title: '仅未通过', value: 'DISAPPROVED' },
]

const presets = [
  { key: '30d' as const, label: '最近 30 天' },
  { key: '180d' as const, label: '最近半年' },
  { key: 'all' as const, label: '全部数据' },
]
</script>

<style scoped lang="scss">
.analytics-filter-bar {
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgba(var(--v-theme-surface), 1);
}

.analytics-filter-bar__quick {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.analytics-filter-bar__actions {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

@media (max-width: 960px) {
  .analytics-filter-bar {
    padding: 16px;
  }

  .analytics-filter-bar__actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
