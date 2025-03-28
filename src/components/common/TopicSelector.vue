<template>
  <v-input v-model="topics">
    <div class="d-flex flex-row flex-wrap justify-start question-topics align-center">
      <template v-if="topics">
        <v-chip
          v-for="(topic, index) in topics"
          :key="topic.id"
          class="ma-1"
          color="primary"
          label
          closable
          @click:close="deleteTopic(index)"
        >
          {{ topic.name }}
        </v-chip>
      </template>
      <template v-if="!topics || max <= 0 || topics.length < max">
        <template v-if="alwaysAdding || isAddingTopic">
          <div class="question-topics-input">
            <v-autocomplete
              v-model="topicSelected"
              v-model:search="topicInput"
              label="添加话题"
              placeholder="搜索已有话题或创建新话题"
              variant="outlined"
              :items="addTopicItems"
              item-title="name"
              item-value="id"
              autofocus
              density="compact"
              single-line
              menu-icon=""
              hide-details
              @blur="closeTopicInput"
              @update:model-value="selectTopic"
              @update:search="fetchTopics"
            >
              <template #item="{ props, item }">
                <template v-if="item.raw.isFakeItem">
                  <v-list-item
                    v-bind="props"
                    :title="t('questions.ask.buttons.createTopic', { name: item.raw.name })"
                  ></v-list-item>
                </template>
                <template v-else>
                  <v-list-item v-bind="props" :title="item.raw.name"></v-list-item>
                </template>
              </template>
            </v-autocomplete>
          </div>
        </template>
        <template v-else>
          <v-btn variant="text" color="primary" prepend-icon="mdi-plus" class="included" @click="isAddingTopic = true">
            {{
              max > 0
                ? t(
                    'questions.ask.buttons.addTopic',
                    { count: topics?.length || 0, max: props.max },
                    topics?.length || 0
                  )
                : t('questions.ask.buttons.addTopicInfinite')
            }}
          </v-btn>
        </template>
      </template>
    </div>
  </v-input>
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
    alwaysAdding?: boolean
  }>(),
  {
    max: -1,
    alwaysAdding: false,
  }
)

const { t } = useI18n()

const topicInput = ref('')
const topicSelected = ref<number | null>(null)
const addTopicItems = ref<
  {
    id: number
    name: string
    isFakeItem?: boolean
  }[]
>([])
const isAddingTopic = ref(false)

const topics = defineModel<Topic[]>()

const deleteTopic = (index: number) => {
  if (!topics.value) {
    topics.value = []
    return
  }
  topics.value.splice(index, 1)
}

const createTopic = async (name: string) => {
  const {
    data: { id },
  } = await TopicsApi.create(name)
  return id
}

const selectTopic = (id: number) => {
  const topic = addTopicItems.value.find((item) => item.id === id)
  if (!topic) {
    return
  }
  if (id === -1) {
    // create new topic
    createTopic(topic.name).then((topicId) => {
      if (!topics.value) {
        topics.value = [{ id: topicId, name: topic.name }]
      } else {
        topics.value.push({ id: topicId, name: topic.name })
      }
      closeTopicInput()
    })
    return
  }
  if (!topics.value) {
    topics.value = [topic]
  } else {
    topics.value.push(topic)
  }
  closeTopicInput()
}

const fetchTopics = debounce(async (value: string) => {
  const q = value?.trim()
  if (!q) {
    addTopicItems.value = []
    return
  }
  try {
    const {
      data: { topics },
    } = await TopicsApi.search(q)
    addTopicItems.value = [
      ...topics,
      {
        id: -1,
        name: q,
        isFakeItem: true,
      },
    ]
  } catch (error) {
    console.error('获取话题失败:', error)
    addTopicItems.value = [{ id: -1, name: q, isFakeItem: true }]
  }
}, 300)

const closeTopicInput = () => {
  isAddingTopic.value = false
  topicInput.value = ''
  topicSelected.value = null
  addTopicItems.value = []
}
</script>

<style lang="scss">
.question-topics-input {
  min-width: 200px;
  flex-shrink: 0;
}
</style>
