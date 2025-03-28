<template>
  <v-card class="navigation-menu pa-0" flat rounded="lg" :class="{ collapsed }">
    <v-list bg-color="transparent" class="py-2 px-1">
      <!-- 导航项目 -->
      <div v-for="(item, index) in navItems" :key="index">
        <!-- 常规导航项 -->
        <v-list-item
          v-if="!item.divider && item.route"
          :prepend-icon="!collapsed ? item.icon : undefined"
          :title="!collapsed ? item.title : undefined"
          rounded="lg"
          class="nav-list-item"
          density="comfortable"
          :to="item.route"
          exact
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

        <!-- 分隔线和标题 -->
        <template v-else>
          <v-divider class="my-2 mx-3"></v-divider>
          <v-list-subheader v-if="!collapsed && item.title" class="text-uppercase text-caption font-weight-medium">
            {{ item.title }}
          </v-list-subheader>
        </template>
      </div>

      <v-divider class="my-2 mx-3"></v-divider>

      <!-- 子项目区块标题 -->
      <v-list-subheader
        v-if="!collapsed"
        class="d-flex align-center justify-space-between text-uppercase text-caption font-weight-medium"
      >
        <span>子项目</span>
        <v-btn
          variant="text"
          density="comfortable"
          icon="mdi-plus"
          size="small"
          color="primary"
          class="mr-2"
          @click="emit('create-subproject')"
        ></v-btn>
      </v-list-subheader>

      <!-- 收缩状态下的添加按钮 -->
      <v-btn
        v-else
        class="mx-1"
        variant="text"
        density="comfortable"
        color="primary"
        @click="emit('create-subproject')"
      >
        <v-icon>mdi-plus</v-icon>
        <v-tooltip location="right" activator="parent">
          <span>创建子项目</span>
        </v-tooltip>
      </v-btn>

      <!-- 子项目列表 -->
      <div v-if="loadingSubprojects" class="d-flex justify-center my-4">
        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
      </div>

      <div v-else-if="subprojects.length === 0" class="pa-4 text-center">
        <p v-if="!collapsed" class="text-body-2 text-medium-emphasis mb-2">暂无子项目</p>
        <v-btn
          v-if="!collapsed"
          variant="tonal"
          prepend-icon="mdi-plus"
          size="small"
          color="primary"
          @click="emit('create-subproject')"
        >
          创建子项目
        </v-btn>
      </div>

      <template v-else>
        <!-- 子项目列表项 -->
        <div
          v-for="subproject in collapsed ? subprojects.slice(0, 5) : subprojects"
          :key="subproject.id"
          class="subproject-item"
          :class="{
            'collapsed-subproject': collapsed,
          }"
          @click="navigateToSubproject(subproject.id)"
        >
          <!-- 展开状态 -->
          <template v-if="!collapsed">
            <div class="d-flex align-center px-4 py-2">
              <div class="subproject-nav-color mr-2" :style="{ backgroundColor: subproject.colorCode }"></div>
              <div class="d-flex flex-column">
                <span class="text-subtitle-2">{{ subproject.name }}</span>
                <span class="text-caption text-medium-emphasis">{{
                  subproject.leader?.nickname || '未指定负责人'
                }}</span>
              </div>
            </div>
          </template>

          <!-- 收缩状态 -->
          <template v-else>
            <div class="d-flex justify-center py-2">
              <div class="subproject-nav-color collapsed" :style="{ backgroundColor: subproject.colorCode }"></div>
              <v-tooltip location="right" activator="parent">
                <span>{{ subproject.name }}</span>
              </v-tooltip>
            </div>
          </template>
        </div>

        <!-- 查看更多按钮 -->
        <div v-if="subprojects.length > 5 && !collapsed" class="text-center mt-2 px-2">
          <v-btn variant="text" size="small" block @click="navigateTo('ProjectSubprojects')">
            查看全部
            <v-icon end>mdi-chevron-right</v-icon>
          </v-btn>
        </div>

        <div v-if="subprojects.length > 5 && collapsed" class="text-center mt-2">
          <v-btn
            variant="text"
            icon="mdi-dots-horizontal"
            size="small"
            color="secondary"
            @click="navigateTo('ProjectSubprojects')"
          >
            <v-tooltip location="right" activator="parent">
              <span>查看全部子项目</span>
            </v-tooltip>
          </v-btn>
        </div>
      </template>

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

import { computed, defineEmits, defineProps, ref } from 'vue'
import { RouteLocationRaw, useRoute, useRouter } from 'vue-router'

// 导航项目类型定义
interface NavItem {
  icon?: string
  title?: string
  route?: RouteLocationRaw
  divider: boolean
}

const props = defineProps<{
  project: Project | null
  subprojects: Project[]
  loadingSubprojects?: boolean
  collapsed?: boolean
}>()

const emit = defineEmits<{
  (e: 'create-subproject'): void
  (e: 'refresh'): void
  (e: 'collapse-toggle', collapsed: boolean): void
}>()

const route = useRoute()
const router = useRouter()

// 导航项目数据
const navItems: NavItem[] = [
  {
    icon: 'mdi-view-dashboard-outline',
    title: '概览',
    route: { name: 'ProjectOverview' },
    divider: false,
  },
  {
    icon: 'mdi-account-group-outline',
    title: '成员',
    route: { name: 'ProjectMembers' },
    divider: false,
  },
  {
    divider: true,
    title: '工作区',
  },
  {
    icon: 'mdi-forum-outline',
    title: '讨论区',
    route: { name: 'ProjectDiscussions' },
    divider: false,
  },
  {
    icon: 'mdi-book-open-page-variant-outline',
    title: '知识库',
    route: { name: 'ProjectKnowledge' },
    divider: false,
  },
]

// 获取项目ID
const projectId = computed(() => Number(route.params.projectId))

// 子项目状态和导航状态
const loadingSubprojects = computed(() => props.loadingSubprojects || false)
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

const isSubprojectActive = (subprojectId: number) => {
  return route.name === 'SubprojectDetail' && Number(route.params.subprojectId) === subprojectId
}

const navigateTo = (name: string | undefined) => {
  if (!name || route.name === name) return

  router.push({
    name,
    params: { projectId: String(projectId.value) },
  })
}

const navigateToSubproject = (subprojectId: number) => {
  router.push({
    name: 'SubprojectDetail',
    params: {
      projectId: String(projectId.value),
      subprojectId: String(subprojectId),
    },
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
}

// 子项目列表项样式
.subproject-item {
  cursor: pointer;
  border-radius: 8px;
  margin: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &.active-subproject {
    background-color: rgba(var(--v-theme-primary), 0.08);
    color: rgb(var(--v-theme-primary));
    font-weight: 500;
    border-left: 2px solid rgb(var(--v-theme-primary));
  }

  &.collapsed-subproject {
    text-align: center;
    padding: 8px 0;
  }
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

.subproject-nav-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  transition: all 0.3s ease;

  &.collapsed {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    margin: 0 auto;
  }
}

// 图标容器样式，确保图标居中
.collapsed-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

// 响应式调整
@media (max-width: 960px) {
  .navigation-menu {
    margin-bottom: 0;
  }
}
</style>
