<template>
  <v-card flat rounded="lg">
    <v-card-item>
      <v-card-title>{{ answer.author.nickname }}</v-card-title>
      <v-card-subtitle>{{ answer.author.intro }}</v-card-subtitle>
      <template #prepend>
        <user-avatar :avatar="answer.author.avatar" />
      </template>
    </v-card-item>
    <v-card-text class="text-body-1 font-weight-regular answer-body-text pb-1">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="rich-content" v-html="contentHtml"></div>
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
import { Answer } from '@/types'
import ContentVoter from '../common/ContentVoter.vue'
import UserAvatar from '../common/UserAvatar.vue'
import { toRefs, computed } from 'vue'
import { parse } from '@/utils/parser'
import { AnswersApi } from '@/network/api/answers'
import { NewAttitudeType } from '@/constants'

const props = defineProps<{
  answer: Answer
}>()

const { answer } = toRefs(props)

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
