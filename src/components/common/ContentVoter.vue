<template>
  <div class="d-flex align-center voter">
    <v-btn color="primary" :variant="upvoteBtnVariant" min-width="32px" @click="upvote">
      <v-icon size="24">mdi-menu-up</v-icon>
    </v-btn>
    <v-btn color="on-background" variant="plain" min-width="0px" class="ms-2" @click="clickCount">
      {{ score }}
    </v-btn>
    <v-btn color="primary" :variant="downvoteBtnVariant" min-width="32px" @click="downvote">
      <v-icon size="24">mdi-menu-down</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

import { NewAttitudeType } from '@/constants'

const emit = defineEmits(['upvote', 'downvote', 'cancelVote', 'clickCount'])

const props = defineProps<{
  score: number
  currentVote?: NewAttitudeType | 'up' | 'down' | null
}>()

const { score, currentVote } = toRefs(props)

const trueCurrentVote = computed(() => {
  if (currentVote.value === 'up' || currentVote.value === 'down' || currentVote.value === null) return currentVote.value
  switch (currentVote.value) {
    case NewAttitudeType.Positive:
      return 'up'
    case NewAttitudeType.Negative:
      return 'down'
    default:
      return null
  }
})

const upvoteBtnVariant = computed(() => {
  return trueCurrentVote.value === 'up' ? 'flat' : 'tonal'
})

const downvoteBtnVariant = computed(() => {
  return trueCurrentVote.value === 'down' ? 'flat' : 'tonal'
})

const upvote = () => {
  if (trueCurrentVote.value === 'up') {
    emit('cancelVote')
  } else {
    emit('upvote')
  }
}

const downvote = () => {
  if (trueCurrentVote.value === 'down') {
    emit('cancelVote')
  } else {
    emit('downvote')
  }
}

const clickCount = () => {
  emit('clickCount')
}
</script>

<style>
.voter .v-btn {
  margin: 0;
}
</style>
