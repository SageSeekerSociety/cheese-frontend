<template>
  <v-container fluid class="analytics-layout">
    <AnalyticsHero :filters="filters" />

    <AnalyticsFilterBar
      v-model="draftFilters"
      class="mt-4"
      :category-items="categoryItems"
      @apply="applyFilters"
      @reset="handleReset"
      @apply-preset="applyPreset"
    />

    <div class="mt-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import type { SpaceAnalyticsQueryState } from './utils'

import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import AnalyticsFilterBar from './components/AnalyticsFilterBar.vue'
import AnalyticsHero from './components/AnalyticsHero.vue'
import { useSpaceAnalyticsFilters } from './composables/useSpaceAnalyticsFilters'
import { formatUtcDate, inferAnalyticsGroupBy } from './utils'

import { useSpaceStore } from '@/stores/space'

const spaceStore = useSpaceStore()
const { categories, currentSpaceId } = storeToRefs(spaceStore)
const { fetchCategories } = spaceStore

const { filters, resetFilters, replaceFilters } = useSpaceAnalyticsFilters()

const draftFilters = ref<SpaceAnalyticsQueryState>({ ...filters.value })

watch(
  filters,
  (value) => {
    draftFilters.value = { ...value }
  },
  { immediate: true }
)

const categoryItems = computed(() => [
  { title: '全部分类', value: null },
  ...categories.value.filter((item) => !item.archivedAt).map((item) => ({ title: item.name, value: item.id })),
])

const applyFilters = async () => {
  await replaceFilters({
    ...draftFilters.value,
    groupBy: inferAnalyticsGroupBy(draftFilters.value.from, draftFilters.value.to),
  })
}

const handleReset = async () => {
  await resetFilters()
}

const applyPreset = async (preset: '30d' | '180d' | 'all') => {
  const toDate = new Date()
  const fromDate = new Date()

  if (preset === '30d') {
    fromDate.setUTCDate(fromDate.getUTCDate() - 30)
  } else if (preset === '180d') {
    fromDate.setUTCDate(fromDate.getUTCDate() - 180)
  } else {
    fromDate.setUTCFullYear(1970, 0, 1)
  }

  draftFilters.value = {
    ...draftFilters.value,
    from: formatUtcDate(fromDate),
    to: formatUtcDate(toDate),
  }

  await applyFilters()
}

watch(
  currentSpaceId,
  (value) => {
    if (value) {
      fetchCategories().catch(() => undefined)
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.analytics-layout {
  padding: 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 960px) {
  .analytics-layout {
    padding: 12px;
  }
}
</style>
