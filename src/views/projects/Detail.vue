<template>
  <v-container class="px-0 px-sm-3 px-md-4">
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else class="px-3 px-md-4">
      <v-row no-gutters>
        <v-col cols="12">
          <router-view
            name="header"
            :project="project"
            :subproject="currentSubproject"
            :subprojects="subprojects"
            @edit-project="openEditDialog"
            @edit-subproject="openEditSubprojectDialog"
          >
          </router-view>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <!-- 左侧导航区域 -->
        <v-col
          :cols="12"
          :md="navCollapsed ? '1' : '3'"
          :lg="navCollapsed ? '1' : '2'"
          class="pr-md-3 d-flex flex-column"
        >
          <router-view
            name="navigation"
            :project="project"
            :subproject="currentSubproject"
            :subprojects="subprojects"
            :loading-subprojects="loadingSubprojects"
            :collapsed="navCollapsed"
            @create-subproject="openCreateSubprojectDialog"
            @refresh="fetchSubprojects"
            @collapse-toggle="handleNavCollapseToggle"
          >
          </router-view>
        </v-col>

        <!-- 右侧内容区域 -->
        <v-col :cols="12" :md="navCollapsed ? '11' : '9'" :lg="navCollapsed ? '11' : '10'" class="pl-md-3 mt-4 mt-md-0">
          <v-card variant="flat" rounded="lg" class="content-area">
            <router-view v-slot="{ Component }" name="content">
              <transition name="fade" mode="out-in">
                <component :is="Component" :project="project" :subprojects="subprojects" @refresh="fetchSubprojects" />
              </transition>
            </router-view>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 编辑项目对话框 -->
    <project-form-dialog
      v-model="editDialog"
      :initial-data="project"
      :is-editing="true"
      :team-members="teamMembers"
      :loading="saving"
      @submit="saveProject"
    />

    <!-- 创建/编辑子项目对话框 -->
    <project-form-dialog
      v-model="subprojectDialog"
      :initial-data="editingSubproject"
      :is-subproject="true"
      :is-editing="!!editingSubproject"
      :team-members="teamMembers"
      :parent-id="project?.id"
      :loading="savingSubproject"
      @submit="saveSubproject"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { Project, User } from '@/types'

import { computed, onMounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import dayjs from 'dayjs'

import ProjectFormDialog from '@/components/projects/forms/ProjectFormDialog.vue'
import { ProjectsApi } from '@/network/api/projects'
import { TeamsApi } from '@/network/api/teams'

const route = useRoute()
const display = useDisplay()

// 页面状态
const projectId = computed(() => Number(route.params.projectId))
const project = ref<Project | null>(null)
const loading = ref(true)

// 导航收缩状态
const navCollapsed = ref(false)

// 子项目状态
const subprojects = ref<Project[]>([])
const loadingSubprojects = ref(false)
const editingSubproject = ref<Project | null>(null)
const subprojectDialog = ref(false)
const teamMembers = ref<User[]>([])
const savingSubproject = ref(false)

// 当前子项目
const currentSubprojectId = computed(() => {
  if (route.name === 'SubprojectDetail') {
    return Number(route.params.subprojectId)
  }
  return 0
})

const currentSubproject = computed(() => {
  if (!currentSubprojectId.value) return null
  return subprojects.value.find((sp) => sp.id === currentSubprojectId.value) || null
})

// 编辑项目状态
const editDialog = ref(false)
const projectForm = ref({
  name: '',
  description: '',
  colorCode: '',
})
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const saving = ref(false)

// 处理导航收缩状态变化
const handleNavCollapseToggle = (collapsed: boolean) => {
  navCollapsed.value = collapsed
  // 存储状态到本地存储
  localStorage.setItem('project_nav_collapsed', navCollapsed.value ? 'true' : 'false')
}

// 获取项目详情
const fetchProject = async () => {
  try {
    loading.value = true
    const response = await ProjectsApi.detail(projectId.value)
    project.value = response.data.project
  } catch (error) {
    console.error('获取项目详情失败', error)
  } finally {
    loading.value = false
  }
}

// 获取子项目列表
const fetchSubprojects = async () => {
  if (!projectId.value) return

  try {
    loadingSubprojects.value = true
    const response = await ProjectsApi.list({
      team_id: project.value?.team.id || 0,
      parent_id: projectId.value,
    })
    subprojects.value = response.data.projects
  } catch (error) {
    console.error('获取子项目列表失败', error)
  } finally {
    loadingSubprojects.value = false
  }
}

// 提供刷新子项目的方法给子组件
provide('refreshSubprojects', fetchSubprojects)
provide('currentSubproject', currentSubproject)
// 提供导航收缩状态给子组件
provide('navCollapsed', navCollapsed)

// 获取团队成员
const fetchTeamMembers = async () => {
  if (!project.value?.team.id) return

  try {
    const response = await TeamsApi.getMembers(project.value.team.id)
    teamMembers.value = response.data.members.map((member) => member.user)
  } catch (error) {
    console.error('获取团队成员失败', error)
  }
}

// 打开编辑对话框
const openEditDialog = () => {
  if (!project.value) return

  projectForm.value = {
    name: project.value.name,
    description: project.value.description,
    colorCode: project.value.colorCode,
  }

  startDate.value = dayjs(project.value.startDate).toDate()
  endDate.value = dayjs(project.value.endDate).toDate()

  editDialog.value = true
}

// 保存项目
const saveProject = async (formData: any) => {
  if (!project.value) return

  try {
    saving.value = true
    await ProjectsApi.update(project.value.id, formData)
    // 刷新项目详情
    await fetchProject()
    editDialog.value = false
  } catch (error) {
    console.error('保存项目失败', error)
  } finally {
    saving.value = false
  }
}

// 打开创建子项目对话框
const openCreateSubprojectDialog = () => {
  if (!project.value) return
  editingSubproject.value = null
  subprojectDialog.value = true
}

// 打开编辑子项目对话框
const openEditSubprojectDialog = () => {
  if (!currentSubproject.value) return
  // 这里暂时只是一个占位功能，实际实现可能需要一个新的对话框
  console.log('编辑子项目', currentSubproject.value.id)
}

// 保存子项目
const saveSubproject = async (formData: any) => {
  try {
    savingSubproject.value = true

    if (editingSubproject.value) {
      await ProjectsApi.update(editingSubproject.value.id, formData)
    } else {
      await ProjectsApi.create(formData)
    }

    // 刷新子项目列表
    await fetchSubprojects()
    subprojectDialog.value = false
  } catch (error) {
    console.error('保存子项目失败', error)
  } finally {
    savingSubproject.value = false
  }
}

// 监听页面加载
onMounted(async () => {
  // 从本地存储中恢复导航收缩状态
  const savedState = localStorage.getItem('project_nav_collapsed')
  if (savedState) {
    navCollapsed.value = savedState === 'true'
  }

  // 在移动设备上默认收缩导航
  if (display.mobile.value) {
    navCollapsed.value = true
  }

  await fetchProject()
  await fetchSubprojects()
  await fetchTeamMembers()
})
</script>

<style scoped lang="scss">
:deep(.v-container) {
  max-width: 1600px;
}

// 项目信息卡片样式
.project-info-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.project-description {
  color: rgba(0, 0, 0, 0.75);
  line-height: 1.6;
}

.project-meta {
  &-item {
    margin-right: 2.5rem;
    margin-bottom: 0.5rem;
  }
}

// 状态卡片样式
.status-overview {
  @media (min-width: 960px) {
    border-left: 1px solid rgba(0, 0, 0, 0.08);
    padding-left: 2rem;
  }
}

.status-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;

  @media (min-width: 960px) {
    justify-content: flex-start;
  }
}

.status-card {
  padding: 1.25rem;
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-radius: 12px;
  min-width: 100px;
  text-align: center;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
  flex: 1;
  max-width: 130px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1);
    background-color: rgba(var(--v-theme-primary), 0.08);
  }

  .status-value {
    font-size: 1.75rem;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
    margin-bottom: 0.5rem;
  }

  .status-label {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.6);
    letter-spacing: 0.3px;
  }
}

// 内容区域样式
.content-area {
  border: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 600px;
  overflow: hidden;
}

// 布局列过渡效果
:deep(.v-col) {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

// 颜色选择器样式
.color-select-btn {
  min-width: 60px;
  height: 30px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

// 路由过渡效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式调整
@media (max-width: 960px) {
  .project-meta-item {
    margin-right: 1.5rem;
  }
}

// 颜色选择器样式
.color-selector-card {
  border: 1px solid rgba(0, 0, 0, 0.09);
  background-color: rgba(0, 0, 0, 0.01);
}

.color-display {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
}

.color-swatch {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
}

.color-swatch-selected {
  transform: scale(1.05);
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.text-mono {
  font-family: monospace;
}

.v-color-picker {
  max-width: 100%;
}
</style>
