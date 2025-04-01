<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent class="gradient-sidebar">
    <v-list-item nav>
      <template #append>
        <v-btn
          variant="text"
          :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <SpaceSidebar :expanded="!rail" />
  </v-navigation-drawer>
  <v-main class="bg-grey-lighten-3">
    <router-view />
  </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import SpaceSidebar from '@/components/spaces/SpaceSidebar.vue'

const drawer = ref(true) // 控制抽屉显示/隐藏
const rail = ref(false) // 控制抽屉是否为 mini 模式
</script>

<style scoped>
.gradient-sidebar {
  border-right: 1px solid rgba(var(--v-theme-primary), 0.05);
}

.v-navigation-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
}

.bg-background {
  background-color: rgb(var(--v-theme-background));
}
</style>
