<template>
  <answer-list :question-id="questionId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AnswerList from '@/components/questions/AnswerList.vue'

const route = useRoute()

const questionId = computed(() => parseInt(route.params.questionId as string))
</script>
