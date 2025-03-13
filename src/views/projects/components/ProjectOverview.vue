<template>
  <div class="pa-4 pa-sm-6">
    <v-row>
      <v-col cols="12" lg="8">
        <!-- 项目内容区域 -->
        <v-card variant="flat" rounded="lg" class="mb-6 content-card">
          <v-card-title class="px-6 pt-5 pb-2 d-flex align-center">
            <span class="text-h6">项目内容</span>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" size="small" prepend-icon="mdi-pencil" class="edit-btn"> 编辑 </v-btn>
          </v-card-title>
          <v-card-text class="px-6 pb-5 pt-2">
            <div v-if="project?.content" class="project-content">
              <div v-html="renderedContent"></div>
            </div>
            <div v-else class="text-center py-8 empty-content">
              <v-icon icon="mdi-file-document-outline" size="48" color="grey-lighten-2" class="mb-3"></v-icon>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">项目内容未填写</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">添加项目详细内容、目标和说明文档</p>
              <v-btn color="primary" variant="tonal" size="small" rounded="lg" prepend-icon="mdi-pencil">
                添加内容
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- 项目进度区域 -->
        <v-card variant="flat" rounded="lg" class="content-card">
          <v-card-title class="px-6 pt-5 pb-2 d-flex align-center">
            <span class="text-h6">项目里程碑</span>
            <v-chip color="primary" variant="flat" size="small" class="ml-2">开发中</v-chip>
          </v-card-title>
          <v-card-text class="px-6 pb-5 pt-2">
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

      <v-col cols="12" lg="4">
        <!-- 成员预览 -->
        <v-card variant="flat" rounded="lg" class="mb-6 content-card">
          <v-card-title class="px-6 pt-5 pb-2 d-flex align-center">
            <span class="text-h6">成员</span>
            <v-chip class="ml-2" size="small" color="primary" variant="flat">{{ project?.members?.count || 0 }}</v-chip>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" size="small" class="view-all-btn" @click="goToMembersTab">
              查看全部
              <v-icon size="small" end>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="px-4 pb-5 pt-2">
            <v-list v-if="project?.members?.examples?.length" class="member-list">
              <v-list-item
                v-for="member in project.members.examples.slice(0, 5)"
                :key="member.id"
                rounded="lg"
                class="member-item mb-1"
              >
                <template #prepend>
                  <v-avatar size="36" class="mr-3">
                    <v-img :src="getAvatarUrl(member.user.avatarId)" />
                  </v-avatar>
                </template>
                <v-list-item-title class="text-subtitle-2">{{ member.user.nickname }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption text-medium-emphasis">
                  {{ getMemberRoleText(member.role) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item
                v-if="project.members.count > 5"
                rounded="lg"
                class="more-members-item text-center"
                @click="goToMembersTab"
              >
                <v-list-item-title class="text-primary"
                  >查看更多成员 ({{ project.members.count - 5 }})</v-list-item-title
                >
              </v-list-item>
            </v-list>

            <div v-else class="text-center py-6">
              <v-icon icon="mdi-account-group-outline" size="40" color="grey-lighten-2" class="mb-3"></v-icon>
              <p class="text-body-2 text-medium-emphasis">暂无成员</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- 最近活动预览 -->
        <v-card variant="flat" rounded="lg" class="content-card">
          <v-card-title class="px-6 pt-5 pb-2">
            <span class="text-h6">最近活动</span>
            <v-chip color="primary" variant="flat" size="small" class="ml-2">开发中</v-chip>
          </v-card-title>
          <v-card-text class="px-6 pb-5 pt-2">
            <div class="text-center py-6">
              <v-icon icon="mdi-history" size="40" color="grey-lighten-2" class="mb-3"></v-icon>
              <h3 class="text-subtitle-1 font-weight-medium mb-2">活动记录功能即将推出</h3>
              <p class="text-body-2 text-medium-emphasis">您将能够查看项目的所有最新动态</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { Project, ProjectMemberRole } from '@/types'

import { computed, defineProps, inject } from 'vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

import { getAvatarUrl } from '@/utils/materials'

// 定义 props
const props = defineProps<{
  project: Project | null
}>()

// 从父组件注入的方法
const goToMembersTab = inject('goToMembersTab', () => {})

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!props.project?.content) return ''
  const rawHtml = marked.parse(props.project.content) as string
  return DOMPurify.sanitize(rawHtml)
})

// 获取成员角色文本
const getMemberRoleText = (role: ProjectMemberRole): string => {
  const roleMap: Record<ProjectMemberRole, string> = {
    LEADER: '项目负责人',
    MEMBER: '项目成员',
    EXTERNAL: '外部协作者',
  }
  return roleMap[role] || '项目成员'
}
</script>

<style scoped lang="scss">
.content-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
  }
}

.project-content {
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.7;
  max-width: 100%;
  overflow-x: auto;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }

  :deep(h1) {
    font-size: 1.75rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding-bottom: 0.75rem;
  }

  :deep(h2) {
    font-size: 1.5rem;
  }

  :deep(h3) {
    font-size: 1.3rem;
  }

  :deep(p) {
    margin-bottom: 1rem;
    line-height: 1.7;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  :deep(li) {
    margin-bottom: 0.5rem;
  }

  :deep(pre) {
    background-color: rgba(0, 0, 0, 0.03);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1rem;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  :deep(code) {
    background-color: rgba(0, 0, 0, 0.03);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    color: rgba(var(--v-theme-primary), 1);
  }

  :deep(blockquote) {
    border-left: 4px solid rgba(var(--v-theme-primary), 0.5);
    padding: 0.5rem 0 0.5rem 1rem;
    margin: 1rem 0;
    color: rgba(0, 0, 0, 0.6);
    background-color: rgba(var(--v-theme-primary), 0.03);
    border-radius: 0 4px 4px 0;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  :deep(th),
  :deep(td) {
    padding: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  :deep(th) {
    background-color: rgba(0, 0, 0, 0.03);
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 6px;
    margin: 1rem 0;
  }

  :deep(a) {
    color: rgb(var(--v-theme-primary));
    text-decoration: none;
    border-bottom: 1px dashed rgba(var(--v-theme-primary), 0.4);
    transition: all 0.2s ease;

    &:hover {
      border-bottom: 1px solid rgba(var(--v-theme-primary), 0.7);
    }
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

.edit-btn,
.view-all-btn {
  opacity: 0.8;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
}

.member-list {
  background-color: transparent;
  padding-top: 0.5rem;

  :deep(.v-list-item__prepend) {
    margin-right: 12px;
  }
}

.member-item {
  transition: all 0.2s ease;
  margin-bottom: 4px;
  border-radius: 8px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
    transform: translateX(2px);
  }
}

.more-members-item {
  border: 1px dashed rgba(var(--v-theme-primary), 0.3);
  background-color: rgba(var(--v-theme-primary), 0.02);
  margin-top: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.05);
    transform: translateX(2px);
  }
}

.project-meta-item {
  margin-right: 2rem;
}
</style>
