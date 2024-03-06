<template>
  <v-avatar color="grey-darken-1" :size="size" v-bind="props" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { hasAvatar, avatar, size } = withDefaults(
  defineProps<{
    avatar: string
    hasAvatar?: boolean
    size?: string | number
  }>(),
  {
    hasAvatar: () => false,
    avatar: () => '',
  }
)

const props = computed(() =>
  hasAvatar
    ? {
        image: avatar,
      }
    : {
        icon: 'mdi-account',
      }
)
</script>
