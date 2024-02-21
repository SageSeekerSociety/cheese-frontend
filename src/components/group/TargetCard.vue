<template>
  <v-card flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <v-card-title
      ><span class="text-h6 font-weight-bold">{{ target.name }}</span></v-card-title
    >
    <v-card-text>
      <!-- <p class="text-body-1">{{ item.author }}：{{ item.content }}</p> -->
      <p class="text-body-1">{{ target.intro }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Target } from '@/types/target'

const { target } = withDefaults(
  defineProps<{
    target: Target
  }>(),
  {}
)
</script>
