<template>
  <v-tabs class="analytics-tabs" color="primary" show-arrows>
    <v-tab
      v-for="tab in tabs"
      :key="tab.name"
      :to="{ name: tab.name, params: { spaceId }, query: route.query }"
      :value="tab.name"
    >
      <v-icon start>{{ tab.icon }}</v-icon>
      {{ tab.label }}
    </v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const spaceId = computed(() => Number(route.params.spaceId))

const tabs = [
  { name: 'SpacesDetailAnalyticsOverview', label: '总览', icon: 'mdi-view-dashboard-outline' },
  { name: 'SpacesDetailAnalyticsAlerts', label: '告警', icon: 'mdi-bell-alert-outline' },
  { name: 'SpacesDetailAnalyticsPublishers', label: '老师', icon: 'mdi-account-tie-outline' },
  { name: 'SpacesDetailAnalyticsTasks', label: '题目', icon: 'mdi-clipboard-text-outline' },
  { name: 'SpacesDetailAnalyticsParticipants', label: '参与者', icon: 'mdi-account-group-outline' },
]
</script>

<style scoped lang="scss">
.analytics-tabs {
  :deep(.v-slide-group__content) {
    gap: 6px;
  }

  :deep(.v-tab) {
    border-radius: 8px;
    min-height: 40px;
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0;
  }
}
</style>
