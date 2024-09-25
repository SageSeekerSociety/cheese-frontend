<template>
  <v-avatar color="grey-darken-1" :size="size" v-bind="props" />
</template>

<script setup lang="ts">
import { API_BASE_URL } from '@/network/utils'
import { computed } from 'vue'

const { avatar, size } = withDefaults(
  defineProps<{
    avatar: string
    size?: string | number
  }>(),
  {
    avatar: () => '',
    size: () => 48,
  }
)

const hasAvatar = computed(() => !!avatar)

const props = computed(() =>
  hasAvatar.value
    ? {
        image: avatar,
      }
    : {
        image: API_BASE_URL + '/avatars/default',
      }
)
</script>
