<template>
  <PageHeader icon="mdi-chart-line" title="数据分析">
    <template #tabs>
      <AnalyticsNavigationTabs />
    </template>
  </PageHeader>

  <AnalyticsLayout />
</template>

<script setup lang="ts">
import AnalyticsNavigationTabs from './components/AnalyticsNavigationTabs.vue'
import AnalyticsLayout from './AnalyticsLayout.vue'

import PageHeader from '@/components/common/PageHeader.vue'
</script>
