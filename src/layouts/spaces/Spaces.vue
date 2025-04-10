<template>
  <v-navigation-drawer v-if="isDetailView" v-model="drawer" :rail="rail" permanent class="gradient-sidebar">
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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import SpaceSidebar from '@/components/spaces/SpaceSidebar.vue'

const route = useRoute()
const drawer = ref(true) // 控制抽屉显示/隐藏
const rail = ref(false) // 控制抽屉是否为 mini 模式

// 只在详情页显示侧边栏
const isDetailView = computed(() => {
  return route.name === 'SpacesDetail' || route.name?.toString().startsWith('SpacesDetail')
})
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
