<template>
  <div class="subproject-discussions">
    <div class="d-flex flex-wrap justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-medium">讨论区</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDiscussionDialog"> 发起讨论 </v-btn>
    </div>

    <!-- 占位内容 -->
    <v-card variant="outlined" rounded="lg" class="mb-4 pa-6">
      <div class="text-center py-8">
        <v-icon icon="mdi-forum-outline" size="64" color="grey-lighten-2" class="mb-3"></v-icon>
        <h3 class="text-h6 font-weight-medium mb-2">讨论区功能开发中</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          这是一个占位模块，子项目讨论区功能将在后续版本中实现。讨论区将提供团队成员之间交流意见、分享进度和解决问题的空间。
        </p>
        <v-btn color="primary" prepend-icon="mdi-bell-outline"> 功能上线时通知我 </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types'

import { defineProps } from 'vue'

const props = defineProps<{
  project: Project | null
  subproject: Project | null
}>()

// 创建讨论对话框
const openCreateDiscussionDialog = () => {
  console.log('功能开发中: 打开创建讨论对话框')
}
</script>

<style scoped lang="scss">
.subproject-discussions {
  .v-card {
    border: 1px solid rgba(0, 0, 0, 0.08);
  }
}
</style>
