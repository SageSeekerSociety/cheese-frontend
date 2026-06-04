<template>
  <v-sheet rounded="lg" class="discussion-card-skeleton pa-0">
    <v-skeleton-loader :height="randomImageHeight" type="image" class="skeleton-top-image"></v-skeleton-loader>
    <div class="pa-3">
      <!-- Title Skeleton (2 lines) -->
      <v-skeleton-loader type="text" width="90%" class="mb-1 skeleton-text-line"></v-skeleton-loader>
      <v-skeleton-loader type="text" width="70%" class="mb-3 skeleton-text-line"></v-skeleton-loader>

      <!-- Preview Skeleton (3 lines) -->
      <v-skeleton-loader type="text" width="100%" class="mb-1 skeleton-text-line"></v-skeleton-loader>
      <v-skeleton-loader type="text" width="100%" class="mb-1 skeleton-text-line"></v-skeleton-loader>
      <v-skeleton-loader type="text" width="80%" class="mb-3 skeleton-text-line"></v-skeleton-loader>

      <!-- Author Skeleton -->
      <div class="d-flex align-center">
        <v-skeleton-loader type="avatar" size="28" class="mr-2 skeleton-avatar"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="80px" class="skeleton-text-line"></v-skeleton-loader>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const randomImageHeight = computed(() => {
  const heights = [160, 200, 240, 280] // Provide a few options for varied height in waterfall
  return heights[Math.floor(Math.random() * heights.length)]
})
</script>

<style scoped lang="scss">
.discussion-card-skeleton {
  background-color: rgb(var(--v-theme-surface));
  overflow: hidden;
  width: 100%;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05); // Match xiaohongshu-card shadow
}

// Target the actual image placeholder part of v-skeleton-loader
:deep(.skeleton-top-image .v-skeleton-loader__image) {
  height: 100% !important; // Fill the v-skeleton-loader's height
  border-top-left-radius: inherit; // Inherit from v-sheet's rounded="lg"
  border-top-right-radius: inherit;
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important; // Consistent skeleton color
}

// Target text lines and avatar parts to ensure consistent color
:deep(.skeleton-text-line .v-skeleton-loader__text),
:deep(.skeleton-avatar .v-skeleton-loader__avatar) {
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important; // Consistent skeleton color
}
</style>
