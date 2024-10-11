<template>
  <v-alert :type="alertType" :title="alertTitle" :text="alertText" variant="tonal"></v-alert>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { TaskSubmissionReview } from '@/types'

const props = defineProps<{
  review: TaskSubmissionReview
}>()

const { review } = toRefs(props)

const alertType = computed(() => {
  if (!review.value || !review.value.reviewed) {
    return 'info'
  }
  return review.value.detail.accepted ? 'success' : 'error'
})

const alertTitle = computed(() => {
  if (!review.value || !review.value.reviewed) {
    return '等待评审中'
  }
  return review.value.detail.accepted ? `已通过 ${review.value.detail.score} 分` : '已驳回'
})

const alertText = computed(() => {
  if (!review.value || !review.value.reviewed) {
    return undefined
  }
  return `评语: ${review.value.detail.comment}`
})
</script>
