<template>
  <template v-if="refreshing">
    <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-avatar, paragraph, button@2" />
  </template>
  <template v-else>
    <question-card v-for="question in questionList" :key="question.id" :data="question" />
  </template>
  <v-card v-if="isEmpty" flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <blank-page />
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserApi } from '@/network/api/users'
import { useRoute } from 'vue-router'
import { usePaging } from '@/utils/paging'
import QuestionCard from '@/components/questions/QuestionCard.vue'
import BlankPage from '@/components/common/BlankPage.vue'

const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0], 10))

const isEmpty = ref(true)

const {
  data: questionList,
  refresh,
  refreshing,
} = usePaging(async (pageStart) => {
  const {
    data: { questions: data, page },
  } = await UserApi.getQuestionList(userID.value, pageStart)
  isEmpty.value = data.length === 0
  return { data, page }
})

onMounted(refresh)
</script>
