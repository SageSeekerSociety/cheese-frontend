<template>
  <div class="text-center">
    <div v-if="countdown && !isExpired" class="countdown-display">
      <span class="countdown-number text-primary">{{ countdown.days }}</span> 天
      <span class="countdown-number text-primary">{{ countdown.hours }}</span> 时
      <span class="countdown-number text-primary">{{ countdown.minutes }}</span> 分
      <span class="countdown-number text-primary">{{ countdown.seconds }}</span> 秒
    </div>
    <div v-else class="expired-text text-error">已截止</div>
    <div v-if="countdown && label" class="text-caption">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  deadline: string | Date | number
  label?: string
}>()

const countdown = ref<{ days: string; hours: string; minutes: string; seconds: string } | null>(null)
const isExpired = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const updateCountdown = () => {
  const now = dayjs()
  const deadline = dayjs(props.deadline)
  const diff = deadline.diff(now)

  if (diff > 0) {
    const durationObj = dayjs.duration(diff)
    countdown.value = {
      days: durationObj.days().toString().padStart(2, '0'),
      hours: durationObj.hours().toString().padStart(2, '0'),
      minutes: durationObj.minutes().toString().padStart(2, '0'),
      seconds: durationObj.seconds().toString().padStart(2, '0'),
    }
    isExpired.value = false
  } else {
    countdown.value = null
    isExpired.value = true
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.countdown-display {
  font-size: 1.2rem;
}
.countdown-number {
  font-weight: bold;
  font-size: 1.4rem;
}
.expired-text {
  font-weight: bold;
  font-size: 1.2rem;
}
</style>
