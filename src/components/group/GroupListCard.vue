<template>
  <h1>grouplistcard</h1>
</template>

<script lang="ts" setup>
import { Group } from '@/types'

const { groupinfo } = withDefaults(
  defineProps<{
    groupinfo: Group
  }>(),
  {}
)
</script>
