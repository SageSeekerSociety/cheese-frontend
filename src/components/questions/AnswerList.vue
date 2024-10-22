<template>
  <v-sheet flat rounded="lg">
    <slot name="header"></slot>
    <template v-if="refreshing">
      <v-skeleton-loader type="list-item-avatar, paragraph, button@2" />
      <v-skeleton-loader type="list-item-avatar, paragraph, button@2" />
    </template>
    <template v-else>
      <template v-if="data.length === 0">
        <blank-page />
      </template>
      <template v-else>
        <answer-card v-for="answer in data" :key="answer.id" :answer="answer" :question="questionData" />
      </template>
    </template>
  </v-sheet>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue'

import { usePaging } from '@/utils/paging'

import AnswerCard from '../answer/AnswerCard.vue'
import BlankPage from '../common/BlankPage.vue'

import { questionDataInjectionKey } from '@/keys'
import { AnswersApi } from '@/network/api/answers'

const props = defineProps<{
  questionId: number
}>()

const questionData = inject(questionDataInjectionKey)

const { data, refresh, loadMore, refreshing, loadingMore } = usePaging(async (pageStart) => {
  const {
    data: { answers: data, page },
  } = await AnswersApi.getAnswers(props.questionId, pageStart)
  return { data, page }
})

onMounted(async () => {
  await refresh()
})
</script>
