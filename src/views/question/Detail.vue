<template>
  <v-container>
    <v-row>
      <v-col v-if="questionData">
        <v-card rounded="lg" flat>
          <v-card-title>{{ questionData.title }}</v-card-title>
          <v-card-text>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="question-content" v-html="contentHtml"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { setTitle } from '@/utils/title'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { onMounted, ref, computed, watch } from 'vue'
import { QuestionApi } from '@/network/api/questions'
import { Question } from '@/types/question'
import { parse } from '@/utils/parser'

const route = useRoute()
const router = useRouter()

const questionData = ref<Question | null>(null)

const contentHtml = computed(() => {
  if (questionData.value) {
    return parse(JSON.parse(questionData.value.content))
  }
  return ''
})

const load = async (id: number) => {
  const {
    data: { question },
  } = await QuestionApi.detail(id)
  questionData.value = question
}

onMounted(async () => {
  await load(parseInt(route.params.id as string))
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    await load(parseInt(to.params.id as string))
  }
})

watch(questionData, (newVal) => {
  if (newVal) {
    setTitle(newVal.title, route)
  }
})
</script>
