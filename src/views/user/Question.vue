<template>
  <v-card v-for="item in questionList" :key="item.title" flat class="pt-2 pb-2 rounded-lg pl-2 pr-2">
    <v-card-title
      ><span class="text-h6 font-weight-bold">{{ item.title }}</span></v-card-title
    >
    <v-card-subtitle>{{ item.content }}</v-card-subtitle>
    <v-card-actions>
      <v-btn variant="plain" color="on-background">
        <v-icon size="18" class="me-2">mdi-message-text</v-icon>
        {{ item.answer_count }}回答
      </v-btn>
      <v-btn variant="plain" color="on-background">
        <v-icon size="18" class="me-2">mdi-star-outline</v-icon>
        {{ item.follow_count }}收藏
      </v-btn>
      <v-btn variant="plain" color="on-background" min-width="32px">
        <v-icon size="18">mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserApi } from '@/network/api/users'
import { useRoute } from 'vue-router'
import { Question } from '@/types'

const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0], 10))
const questionList = ref<Question[]>([])
const loaded = ref(false)

onMounted(() => {
  fetchData().then(({ data: { questions } }) => {
    questionList.value = questions
    loaded.value = true
  })
})

function fetchData() {
  const result = UserApi.getQuestionList(userID.value, {
    pageStart: 0,
    pageSize: 10,
  })
  return result
}
</script>
