<template>
  <v-card class="navigation-menu pa-0" flat rounded="lg" :class="{ collapsed }">
    <v-list bg-color="transparent" class="py-2 px-1">
      <!-- 返回主项目按钮 -->
      <v-list-item
        :prepend-icon="!collapsed ? 'mdi-arrow-left' : undefined"
        :title="!collapsed ? '返回主项目' : undefined"
        rounded="lg"
        class="back-button mb-2"
        density="comfortable"
        @click="backToMainProject"
      >
        <template v-if="collapsed" #prepend>
          <div class="collapsed-icon-container">
            <v-icon icon="mdi-arrow-left"></v-icon>
          </div>
          <v-tooltip location="right" activator="parent">
            <span>返回主项目</span>
          </v-tooltip>
        </template>
      </v-list-item>

      <v-divider class="my-2 mx-3"></v-divider>

      <!-- 子项目名称标题 -->
      <div v-if="!collapsed" class="subproject-header pa-3">
        <div class="d-flex align-center">
          <div
            class="subproject-color-indicator mr-2"
            :style="{ backgroundColor: subproject?.colorCode || '#f97316' }"
          ></div>
          <h3 class="text-subtitle-1 font-weight-medium text-truncate">{{ subproject?.name || '子项目' }}</h3>
        </div>
        <div v-if="subproject?.leader" class="text-caption text-medium-emphasis mt-1">
          负责人: {{ subproject.leader.nickname }}
        </div>
      </div>

      <!-- 收缩状态的子项目指示器 -->
      <div v-else class="d-flex justify-center my-3">
        <div
          v-tooltip="{
            text: subproject?.name || '子项目',
            location: 'right',
            openDelay: 300,
          }"
          class="subproject-color-indicator-collapsed"
          :style="{ backgroundColor: subproject?.colorCode || '#f97316' }"
        ></div>
      </div>

      <v-divider class="my-2 mx-3"></v-divider>

      <!-- 导航项目 -->
      <div v-for="(item, index) in navItems" :key="index">
        <v-list-item
          :prepend-icon="!collapsed ? item.icon : undefined"
          :title="!collapsed ? item.title : undefined"
          rounded="lg"
          :active="isActive(item.section)"
          class="nav-list-item"
          density="comfortable"
          @click="navigateTo(item.section)"
        >
          <template v-if="collapsed">
            <div class="collapsed-icon-container">
              <v-icon :icon="item.icon"></v-icon>
            </div>
            <v-tooltip location="right" activator="parent">
              <span>{{ item.title }}</span>
            </v-tooltip>
          </template>
        </v-list-item>
      </div>

      <v-divider class="my-2 mx-3"></v-divider>

      <!-- 共享导航项 -->
      <div v-for="(item, index) in sharedItems" :key="index">
        <v-list-item
          :prepend-icon="!collapsed ? item.icon : undefined"
          :title="!collapsed ? item.title : undefined"
          rounded="lg"
          :active="false"
          class="nav-list-item shared-item"
          density="comfortable"
          @click="navigateToProjectSection(item.route)"
        >
          <template v-if="!collapsed" #append>
            <v-icon size="x-small" color="grey-darken-1">mdi-share-variant</v-icon>
          </template>
          <template v-if="collapsed">
            <div class="collapsed-icon-container">
              <v-icon :icon="item.icon"></v-icon>
            </div>
            <v-tooltip location="right" activator="parent">
              <span>{{ item.title }}（共享）</span>
            </v-tooltip>
          </template>
        </v-list-item>
      </div>

      <!-- 底部收缩按钮 -->
      <div class="nav-collapse-container mt-auto">
        <v-divider class="my-2 mx-3"></v-divider>
        <div class="d-flex justify-center pa-2">
          <v-btn
            variant="text"
            density="comfortable"
            :icon="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            size="small"
            class="nav-collapse-btn"
            @click="toggleNavCollapse"
          ></v-btn>
        </div>
      </div>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import type { Project } from '@/types'

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

// 导航项目类型定义
interface NavItem {
  icon: string
  title: string
  section: string
}

interface SharedItem {
  icon: string
  title: string
  route: string
}

const props = defineProps<{
  project: Project | null
  subproject: Project | null
  collapsed?: boolean
}>()

const emit = defineEmits<{
  (e: 'collapse-toggle', collapsed: boolean): void
}>()

const route = useRoute()
const router = useRouter()
const display = useDisplay()

// 导航项目数据
const navItems: NavItem[] = [
  {
    icon: 'mdi-view-dashboard-outline',
    title: '概览',
    section: 'overview',
  },
  {
    icon: 'mdi-forum-outline',
    title: '讨论区',
    section: 'discussions',
  },
]

// 共享项目数据
const sharedItems: SharedItem[] = [
  {
    icon: 'mdi-account-group-outline',
    title: '成员',
    route: 'ProjectMembers',
  },
  {
    icon: 'mdi-book-open-page-variant-outline',
    title: '知识库',
    route: 'ProjectKnowledge',
  },
]

// 获取项目和子项目ID
const projectId = computed(() => Number(route.params.projectId))
const subprojectId = computed(() => Number(route.params.subprojectId))

// 导航收缩状态
const isCollapsed = ref(props.collapsed || false)

// 计算属性，从父组件接收初始值，后续由组件内部维护
const collapsed = computed({
  get: () => props.collapsed ?? isCollapsed.value,
  set: (value) => {
    isCollapsed.value = value
  },
})

// 切换导航收缩状态
const toggleNavCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  // 向父组件发送事件
  emit('collapse-toggle', isCollapsed.value)
}

// 检查当前激活的导航项
const currentSection = computed(() => {
  // 这里从路由中提取子项目当前所在的具体页面部分
  // 默认为概览
  return route.query.section || 'overview'
})

// 检查导航项是否激活
const isActive = (section: string) => {
  return currentSection.value === section
}

// 导航方法
const navigateTo = (section: string) => {
  // 在子项目内部导航
  router.push({
    name: 'SubprojectDetail',
    params: {
      projectId: String(projectId.value),
      subprojectId: String(subprojectId.value),
    },
    query: {
      section,
    },
  })
}

// 返回主项目
const backToMainProject = () => {
  router.push({
    name: 'ProjectOverview',
    params: { projectId: String(projectId.value) },
  })
}

// 导航到主项目的特定部分
const navigateToProjectSection = (routeName: string) => {
  router.push({
    name: routeName,
    params: { projectId: String(projectId.value) },
  })
}
</script>

<style scoped lang="scss">
// 导航菜单样式
.navigation-menu {
  border: 1px solid rgba(0, 0, 0, 0.08);
  height: 100%;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.collapsed {
    .v-list-item {
      padding-left: 8px;
      padding-right: 8px;
      justify-content: center;
    }

    .v-list {
      padding: 8px 2px;
    }

    .collapsed-icon-container {
      display: flex;
      justify-content: center;
      width: 100%;

      .v-icon {
        margin: 0 auto;
      }
    }
  }

  .v-list {
    padding: 8px;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .v-list-item {
    min-height: 42px;
    margin-bottom: 2px;
    transition: all 0.3s ease;

    &--active {
      background-color: rgba(var(--v-theme-primary), 0.08);
      color: rgb(var(--v-theme-primary));
      font-weight: 500;
    }
  }

  .nav-list-item {
    margin-left: 4px;
    margin-right: 4px;
  }

  .shared-item {
    opacity: 0.85;

    &:hover {
      opacity: 1;
    }
  }
}

.back-button {
  margin-left: 4px;
  margin-right: 4px;
  background-color: rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
    transform: translateX(-2px);
  }
}

// 图标容器样式，确保图标居中
.collapsed-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

// 底部收缩按钮容器
.nav-collapse-container {
  margin-top: auto;
}

// 导航收缩按钮样式
.nav-collapse-btn {
  opacity: 0.7;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.05);
    transform: scale(1.1);
  }
}

.subproject-header {
  padding: 8px 12px;
}

.subproject-color-indicator {
  width: 8px;
  height: 18px;
  border-radius: 3px;
}

.subproject-color-indicator-collapsed {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
}

// 响应式调整
@media (max-width: 960px) {
  .navigation-menu {
    margin-bottom: 0;
  }
}
</style>
