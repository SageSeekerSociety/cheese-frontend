<template>
  <div class="subproject-overview">
    <div class="d-flex flex-wrap justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-medium">概览</h2>
    </div>

    <v-row>
      <!-- 左侧主要内容区域 -->
      <v-col cols="12" lg="8">
        <!-- 项目内容/文档卡片 -->
        <v-card variant="outlined" rounded="lg" class="mb-5 content-card">
          <v-card-title class="px-4 pt-4 pb-2 d-flex align-center">
            <span class="text-h6">项目内容</span>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" size="small" prepend-icon="mdi-pencil" class="edit-btn"> 编辑 </v-btn>
          </v-card-title>
          <v-card-text class="px-4 pb-4">
            <div class="text-center py-6 empty-content">
              <v-icon icon="mdi-file-document-outline" size="48" color="grey-lighten-2" class="mb-3"></v-icon>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">项目内容未填写</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">添加子项目详细内容、目标和说明文档</p>
              <v-btn color="primary" variant="tonal" size="small" rounded="lg" prepend-icon="mdi-pencil">
                添加内容
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- 里程碑系统 (占位模式) -->
        <v-card variant="outlined" rounded="lg" class="content-card">
          <v-card-title class="px-4 pt-4 pb-2 d-flex align-center">
            <span class="text-h6">项目里程碑</span>
            <v-chip color="primary" variant="flat" size="small" class="ml-2">开发中</v-chip>
          </v-card-title>
          <v-card-text class="px-4 pb-4">
            <div class="text-center py-6">
              <v-icon icon="mdi-flag-outline" size="48" color="grey-lighten-2" class="mb-3"></v-icon>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">里程碑功能开发中</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                这是一个占位模块，里程碑功能将在后续版本中实现。里程碑系统将帮助您跟踪项目的关键节点和阶段性目标。
              </p>
              <v-btn color="primary" prepend-icon="mdi-bell-outline"> 功能上线时通知我 </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右侧信息与状态区域 -->
      <v-col cols="12" lg="4">
        <!-- 最近活动卡片 -->
        <v-card variant="outlined" rounded="lg" class="mb-5 content-card">
          <v-card-title class="px-4 pt-4 pb-2">
            <span class="text-h6">最近活动</span>
            <v-chip color="primary" variant="flat" size="small" class="ml-2">开发中</v-chip>
          </v-card-title>
          <v-card-text class="px-4 pb-4">
            <div class="text-center py-6">
              <v-icon icon="mdi-history" size="40" color="grey-lighten-2" class="mb-3"></v-icon>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">活动记录功能即将推出</h3>
              <p class="text-body-2 text-medium-emphasis">您将能够查看子项目的所有最新动态</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- 团队协作卡片 -->
        <v-card variant="outlined" rounded="lg" class="content-card">
          <v-card-title class="px-4 pt-4 pb-2">
            <span class="text-h6">团队协作</span>
            <v-chip color="primary" variant="flat" size="small" class="ml-2">开发中</v-chip>
          </v-card-title>
          <v-card-text class="px-4 pb-4">
            <div class="text-center py-6">
              <v-icon icon="mdi-account-group-outline" size="40" color="grey-lighten-2" class="mb-3"></v-icon>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">协作功能开发中</h3>
              <p class="text-body-2 text-medium-emphasis">查看参与此子项目的团队成员及其贡献</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types'

import { defineEmits, defineProps } from 'vue'

const props = defineProps<{
  project: Project | null
  subproject: Project | null
}>()

const emit = defineEmits(['refresh'])
</script>

<style scoped lang="scss">
.subproject-overview {
  .content-card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(0, 0, 0, 0.12);
    }
  }

  .empty-content {
    background-color: rgba(0, 0, 0, 0.01);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }

  .edit-btn {
    opacity: 0.8;
    transition: all 0.2s ease;

    &:hover {
      opacity: 1;
      transform: translateY(-1px);
    }
  }
}
</style>
