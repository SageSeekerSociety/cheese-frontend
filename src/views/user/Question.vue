<template>
  <template v-if="refreshing">
    <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-avatar, paragraph, button@2" />
  </template>
  <template v-else>
    <question-card v-for="question in questionList" :key="question.id" :data="question" />
  </template>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { UserApi } from '@/network/api/users'
import { useRoute } from 'vue-router'
import QuestionCard from '@/components/questions/QuestionCard.vue'
import { usePaging } from '@/utils/paging'

const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0], 10))

const {
  data: questionList,
  refresh,
  refreshing,
} = usePaging(async (pageStart) => {
  const {
    data: { questions: data, page },
  } = await UserApi.getQuestionList(userID.value, pageStart)
  return { data, page }
})

onMounted(refresh)
</script>
