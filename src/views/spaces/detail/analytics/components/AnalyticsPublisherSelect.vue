<template>
  <v-select
    v-model="model"
    :items="items"
    :loading="loading"
    label="老师"
    density="comfortable"
    hide-details
    variant="outlined"
    clearable
  />
</template>

<script setup lang="ts">
import type { SpaceAnalyticsQueryState } from '../utils'

import { computed, onMounted, ref, watch } from 'vue'

import { buildAnalyticsApiParams } from '../utils'

import { SpacesApi } from '@/network/api/spaces'

const props = defineProps<{
  spaceId: number
  filters: SpaceAnalyticsQueryState
}>()

const model = defineModel<number | null>({ required: true })

const loading = ref(false)
const publishers = ref<Array<{ title: string; value: number | null }>>([{ title: '全部老师', value: null }])

const params = computed(() => buildAnalyticsApiParams('publishers', props.filters))

const load = async () => {
  loading.value = true
  try {
    const { data } = await SpacesApi.getAnalyticsPublishers(props.spaceId, params.value)
    publishers.value = [
      { title: '全部老师', value: null },
      ...data.publishers.map((publisher) => ({
        title: publisher.publisherName,
        value: publisher.publisherId,
      })),
    ]
  } catch (error) {
    console.error('load analytics publishers failed', error)
  } finally {
    loading.value = false
  }
}

watch(params, () => {
  load().catch(() => undefined)
})

onMounted(() => {
  load().catch(() => undefined)
})

const items = computed(() => publishers.value)
</script>
