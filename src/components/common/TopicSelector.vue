<template>
  <v-autocomplete
    v-model:search="topicInput"
    :model-value="topics"
    :items="addTopicItems"
    :loading="isLoading"
    label="添加话题"
    placeholder="搜索已有话题或创建新话题"
    variant="outlined"
    item-title="name"
    item-value="id"
    chips
    closable-chips
    multiple
    return-object
    :no-filter="true"
    hide-no-data
    auto-select-first
    @update:model-value="onTopicsUpdate"
    @update:search="fetchTopics"
    @focus="onFocus"
  >
    <template #chip="{ props, item }">
      <v-chip v-bind="props" :text="item.raw.name"></v-chip>
    </template>

    <template #item="{ props, item }">
      <v-list-item
        v-if="item.raw.isFakeItem"
        v-bind="props"
        :title="t('questions.ask.buttons.createTopic', { name: item.raw.name })"
        prepend-icon="mdi-plus"
      ></v-list-item>
      <v-list-item v-else v-bind="props" :title="item.raw.name"></v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
import type { Topic } from '@/types'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce } from 'lodash-es'

import { TopicsApi } from '@/network/api/topics'

const props = withDefaults(
  defineProps<{
    max?: number
    defaultTopics?: Topic[]
  }>(),
  {
    max: -1,
    defaultTopics: () => [],
  }
)

const { t } = useI18n()

const topics = defineModel<Topic[]>({ default: () => [] })

const topicInput = ref('')
const isLoading = ref(false)
const addTopicItems = ref<
  {
    id: number
    name: string
    isFakeItem?: boolean
  }[]
>([])

const createTopic = async (name: string) => {
  try {
    isLoading.value = true
    const {
      data: { id },
    } = await TopicsApi.create(name)
    return id
  } finally {
    isLoading.value = false
  }
}

const onTopicsUpdate = async (newTopics: Topic[]) => {
  // Optimistic update
  topics.value = newTopics

  // Check if any topics need creation (id === -1)
  // We use type assertion since the fake item comes from addTopicItems which has extra props
  const hasFake = newTopics.some((t: any) => t.id === -1)
  if (!hasFake) return

  const finalTopics = [...newTopics]
  let changed = false

  for (let i = 0; i < finalTopics.length; i++) {
    const topic = finalTopics[i] as any
    if (topic.id === -1) {
      try {
        const newId = await createTopic(topic.name)
        // successful creation, replace with real topic (stripping isFakeItem)
        finalTopics[i] = { id: newId, name: topic.name }
        changed = true
      } catch (error) {
        console.error('Create topic failed', error)
        // If creation failed, remove it from list
        finalTopics.splice(i, 1)
        i--
        changed = true
      }
    }
  }

  if (changed) {
    topics.value = finalTopics
  }
}

const fetchTopics = debounce(async (value: string) => {
  const q = value?.trim()
  if (!q) {
    addTopicItems.value = [...props.defaultTopics]
    return
  }

  try {
    isLoading.value = true
    const {
      data: { topics: result },
    } = await TopicsApi.search(q)

    const items: { id: number; name: string; isFakeItem?: boolean }[] = [...result]
    // Add create option if it doesn't strictly match existing
    if (!items.find((i) => i.name === q)) {
      items.push({
        id: -1,
        name: q,
        isFakeItem: true,
      })
    }

    addTopicItems.value = items
  } catch (error) {
    console.error('获取话题失败:', error)
    // On error, still allow creating?
    addTopicItems.value = [{ id: -1, name: q, isFakeItem: true }]
  } finally {
    isLoading.value = false
  }
}, 300)

const onFocus = () => {
  if (!topicInput.value) {
    fetchTopics('')
  }
}
</script>

<style lang="scss">
// Removed custom styles as v-autocomplete handles layout
</style>
