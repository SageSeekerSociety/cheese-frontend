<template>
  <v-avatar color="grey-darken-1" :size="size" v-bind="props" />
</template>

<script setup lang="ts">
import { API_BASE_URL } from '@/network/utils'
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
    size: () => 48,
  }
)

const props = computed(() =>
  hasAvatar
    ? {
        image: avatar,
      }
    : {
        image: API_BASE_URL + '/avatars/default',
      }
)
</script>
