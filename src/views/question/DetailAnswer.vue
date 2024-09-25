<template>
  <div>
    <v-btn
      v-if="questionData"
      exact
      block
      variant="flat"
      class="mb-4"
      color="surface"
      :to="{ name: 'QuestionAnswerList' }"
    >
      {{
        t('questions.detail.buttons.allAnswers', {
          count: questionData.answer_count,
        })
      }}
    </v-btn>
    <v-skeleton-loader v-else type="heading" class="mb-4" />
    <answer-card v-if="answerData" :answer="answerData" :question="questionData" />
    <v-skeleton-loader v-else type="list-item-avatar, paragraph, button@2" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { AnswersApi } from '@/network/api/answers'
import { Answer, Question } from '@/types'
import AnswerCard from '@/components/answer/AnswerCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()

const questionData = ref<Question | null>(null)
const answerData = ref<Answer | null>(null)

const questionId = computed(() => parseInt(route.params.questionId as string))
const answerId = computed(() => parseInt(route.params.answerId as string))

onMounted(async () => {
  const {
    data: { question, answer },
  } = await AnswersApi.getAnswerDetail(questionId.value, answerId.value)
  console.log(question, answer)
  questionData.value = question
  answerData.value = answer
})
</script>
