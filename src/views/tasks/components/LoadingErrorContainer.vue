<template>
  <v-container v-if="loading" class="d-flex justify-center align-center" style="min-height: 400px">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </v-container>

  <v-container v-else-if="error" class="d-flex justify-center align-center flex-column" style="min-height: 400px">
    <v-alert type="error" title="加载失败" :text="error"></v-alert>
    <v-btn color="primary" class="mt-4" @click="$emit('retry')">重试</v-btn>
  </v-container>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
  error: string | null
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>
