<template>
  <div class="d-flex align-center w-100">
    <div class="d-flex align-center">
      <v-btn icon="mdi-arrow-left" variant="text" density="comfortable" @click="discussionData.goBack"></v-btn>
      <div class="d-flex flex-column ml-3">
        <h2 class="text-h6 mb-0">{{ discussionData.channelName }}</h2>
        <span class="text-caption text-medium-emphasis">完整讨论</span>
      </div>
    </div>
    <v-spacer></v-spacer>
    <div v-if="discussionData.isCurrentUserMessage" class="d-flex align-center">
      <v-btn icon="mdi-dots-vertical" variant="text" density="comfortable">
        <v-menu activator="parent" :close-on-content-click="true">
          <v-list density="compact">
            <v-list-item @click="discussionData.deleteMessage">
              <template #prepend>
                <v-icon size="small" color="error">mdi-delete-outline</v-icon>
              </template>
              <v-list-item-title class="text-error">删除讨论</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

// 直接从父组件注入所需数据
const discussionData = inject('discussionData', {
  channelName: '讨论详情',
  channelId: '',
  isCurrentUserMessage: false,
  deleteMessage: () => {},
  goBack: () => {},
})
</script>

<style scoped lang="scss">
/* 可能需要的样式 */
</style>
