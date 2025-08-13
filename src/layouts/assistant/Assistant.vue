<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="gradient-sidebar" :width="rail ? 80 : 300">
    <AssistantSidebar :expanded="!rail" @toggle-expand="rail = !rail" />
  </v-navigation-drawer>

  <v-main class="bg-grey-lighten-4">
    <router-view />
  </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import AssistantSidebar from '@/components/assistant/AssistantSidebar.vue'

const drawer = ref(true)
const rail = ref(false)
</script>

<style scoped>
.gradient-sidebar {
  border-right: 1px solid rgba(var(--v-theme-primary), 0.05);
  transition: width 0.3s ease;
}

.v-navigation-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
}

/* 确保主要内容区域正确响应侧边栏宽度变化 */
.v-main {
  transition:
    margin-left 0.3s ease,
    padding-left 0.3s ease;
}
</style>
