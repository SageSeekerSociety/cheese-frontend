<!-- eslint-disable vue/no-v-html -->
<template>
  <v-card :id="`answer-${answer.id}`" flat rounded="lg">
    <v-card-item>
      <v-card-title>{{ answer.author.nickname }}</v-card-title>
      <v-card-subtitle>{{ answer.author.intro }}</v-card-subtitle>
      <template #prepend>
        <user-avatar :avatar="answer.author.avatar" />
      </template>
    </v-card-item>
    <v-card-text class="text-body-1 font-weight-regular answer-body-text pb-1 px-3">
      <collapsible-content :max-height="200">
        <div class="rich-content" v-html="contentHtml"></div>
      </collapsible-content>
      <div v-if="question && question.author.id === currentUserId" class="mt-4">
        <v-btn
          v-if="!question.accepted_answer"
          color="success"
          variant="flat"
          prepend-icon="mdi-check"
          @click="acceptAnswer"
        >
          {{ $t('questions.detail.buttons.accept') }}
        </v-btn>
      </div>
    </v-card-text>
    <v-card-actions class="px-3">
      <content-voter
        :score="answer.attitudes.difference"
        :current-vote="currentVote"
        class="me-2"
        @upvote="upvote"
        @downvote="downvote"
        @cancel-vote="cancelVote"
      />
      <v-btn variant="plain">
        <v-icon size="18" class="me-2">mdi-comment-outline</v-icon>
        {{ $t('questions.detail.buttons.comment') }}
        <span v-if="answer.comment_count">{{ answer.comment_count }}</span>
      </v-btn>
      <v-btn variant="plain" @click="favorite">
        <v-icon size="18" class="me-2">mdi-star-outline</v-icon>
        {{ answer.is_favorite ? $t('questions.detail.buttons.unfavorite') : $t('questions.detail.buttons.favorite') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Answer, Question } from '@/types'
import ContentVoter from '../common/ContentVoter.vue'
import UserAvatar from '../common/UserAvatar.vue'
import CollapsibleContent from '../common/CollapsibleContent.vue'
import { toRefs, computed, inject } from 'vue'
import { parse } from '@/utils/parser'
import { AnswersApi } from '@/network/api/answers'
import { QuestionApi } from '@/network/api/questions'
import { NewAttitudeType } from '@/constants'
import { currentUserId } from '@/services/account'
import { toast } from 'vuetify-sonner'
import { refreshInjectionKey } from '@/keys'

const props = withDefaults(
  defineProps<{
    answer: Answer
    question?: Question | null
  }>(),
  {
    question: null,
  }
)

const { answer, question } = toRefs(props)

const contentHtml = computed(() => parse(JSON.parse(answer.value.content)))
const currentVote = computed(() => {
  switch (answer.value.attitudes.user_attitude) {
    case NewAttitudeType.Positive:
      return 'up'
    case NewAttitudeType.Negative:
      return 'down'
    default:
      return null
  }
})

const refresh = inject(refreshInjectionKey, () => {})

const acceptAnswer = async () => {
  if (!question.value) return
  await QuestionApi.acceptAnswer(question.value.id, answer.value.id)
  toast.success('采纳成功')
  refresh()
}

const upvote = async () => {
  const { data } = await AnswersApi.postAttitude(answer.value.question_id, answer.value.id, NewAttitudeType.Positive)
  answer.value.attitudes = data.attitudes
}

const downvote = async () => {
  const { data } = await AnswersApi.postAttitude(answer.value.question_id, answer.value.id, NewAttitudeType.Negative)
  answer.value.attitudes = data.attitudes
}
const cancelVote = async () => {
  const { data } = await AnswersApi.postAttitude(answer.value.question_id, answer.value.id, NewAttitudeType.None)
  answer.value.attitudes = data.attitudes
}

const favorite = async () => {
  if (answer.value.is_favorite) {
    await AnswersApi.unfavorite(answer.value.question_id, answer.value.id)
    answer.value.is_favorite = false
  } else {
    await AnswersApi.favorite(answer.value.question_id, answer.value.id)
    answer.value.is_favorite = true
  }
}
</script>
