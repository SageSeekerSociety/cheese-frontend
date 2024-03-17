<template>
  <answer-list :question-id="questionId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import AnswerList from '@/components/questions/AnswerList.vue'

const route = useRoute()

const questionId = computed(() => parseInt(route.params.questionId as string))
</script>
