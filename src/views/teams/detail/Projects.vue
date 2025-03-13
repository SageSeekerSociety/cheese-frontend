<template>
  <div>
    <v-sheet class="mb-4" variant="flat" rounded="lg" color="transparent">
      <div class="d-flex flex-wrap gap-4 align-center">
        <v-select
          v-model="filter.leaderId"
          label="负责人"
          density="compact"
          flat
          hide-details
          rounded="lg"
          single-line
          variant="solo"
          clearable
          :items="teamMembers"
          item-title="nickname"
          item-value="id"
          return-object
          style="min-width: auto"
        ></v-select>
        <v-spacer></v-spacer>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog"> 创建项目 </v-btn>
      </div>
    </v-sheet>

    <!-- 项目列表 -->
    <div v-if="loading">
      <v-row>
        <v-col v-for="i in 6" :key="i" cols="12" sm="6" md="4">
          <v-card class="project-card fill-height skeleton-card" rounded="lg">
            <!-- 模拟项目卡片头部 -->
            <div class="project-header">
              <div class="skeleton-color-dot"></div>
              <div class="d-flex align-center px-4 py-3">
                <div class="skeleton-letter-avatar mr-3"></div>
                <div style="flex: 1">
                  <div class="skeleton-text-line" style="width: 70%; height: 16px; margin-bottom: 6px"></div>
                  <div class="skeleton-text-line" style="width: 40%; height: 12px"></div>
                </div>
              </div>
            </div>

            <!-- 模拟项目卡片内容 -->
            <div class="pa-4">
              <div class="skeleton-text-line" style="width: 100%; height: 12px; margin-bottom: 8px"></div>
              <div class="skeleton-text-line" style="width: 90%; height: 12px; margin-bottom: 8px"></div>
              <div class="skeleton-text-line" style="width: 80%; height: 12px; margin-bottom: 16px"></div>
              <div class="skeleton-text-line" style="width: 50%; height: 12px"></div>
            </div>

            <!-- 模拟项目卡片底部 -->
            <div class="px-4 pb-4 d-flex align-center">
              <div class="d-flex align-center">
                <div
                  class="skeleton-circle"
                  style="width: 28px; height: 28px; margin-right: -8px; border: 2px solid white"
                ></div>
                <div
                  class="skeleton-circle"
                  style="width: 28px; height: 28px; margin-right: -8px; border: 2px solid white"
                ></div>
                <div class="skeleton-circle" style="width: 28px; height: 28px; border: 2px solid white"></div>
              </div>
              <v-spacer></v-spacer>
              <div class="skeleton-text-line" style="width: 80px; height: 14px"></div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else-if="projects.length === 0" class="empty-state">
      <div class="text-center py-12">
        <v-icon icon="mdi-briefcase-outline" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
        <h3 class="text-h6 font-weight-medium mb-2">暂无项目</h3>
        <p class="text-body-2 text-medium-emphasis mb-6">创建第一个项目，开始组织和管理您的工作</p>
      </div>
    </div>

    <v-row v-else>
      <v-col v-for="project in projects" :key="project.id" cols="12" sm="6" md="4">
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            class="project-card fill-height"
            rounded="lg"
            :class="isHovering ? 'card-hover' : ''"
            @click="goToProjectDetail(project.id)"
          >
            <!-- 顶部区域 -->
            <div class="project-header">
              <div class="project-color-dot" :style="{ backgroundColor: project.colorCode }"></div>
              <div class="d-flex align-center px-4 py-3">
                <div class="project-letter-avatar mr-3">
                  <span>{{ project.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="text-subtitle-1 font-weight-medium text-truncate mb-0">{{ project.name }}</p>
                  <div class="d-flex align-center">
                    <v-icon size="14" color="grey-darken-1" class="mr-1">mdi-calendar-range</v-icon>
                    <span class="text-caption text-medium-emphasis">{{
                      formatDateRange(project.startDate, project.endDate)
                    }}</span>
                  </div>
                </div>
                <v-spacer></v-spacer>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      variant="text"
                      size="small"
                      density="comfortable"
                      class="action-btn"
                      @click.stop
                    ></v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click.stop="editProject(project)">
                      <template #prepend>
                        <v-icon size="small">mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>编辑</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click.stop="confirmDelete(project)">
                      <template #prepend>
                        <v-icon size="small" color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title class="text-error">删除</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <!-- 内容区域 -->
            <v-card-text class="pa-4">
              <p class="text-body-2 description-text">{{ project.description }}</p>

              <div class="d-flex align-center mt-4">
                <v-icon size="16" color="grey-darken-1" class="mr-2">mdi-account</v-icon>
                <span class="text-body-2">{{ getLeaderName(project) }}</span>
              </div>
            </v-card-text>

            <!-- 底部区域 -->
            <v-card-actions class="pa-4 pt-0">
              <div class="member-avatars">
                <v-avatar
                  v-for="member in project.members.examples.slice(0, 3)"
                  :key="member.id"
                  size="28"
                  class="member-avatar"
                >
                  <v-img :src="getAvatarUrl(member.user.avatarId)" />
                </v-avatar>
                <v-avatar v-if="project.members.count > 3" size="28" class="member-avatar more-members">
                  <span class="text-caption">+{{ project.members.count - 3 }}</span>
                </v-avatar>
              </div>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                size="small"
                color="primary"
                :ripple="false"
                class="view-details-btn"
                @click.stop="goToProjectDetail(project.id)"
              >
                <span class="text-none">查看详情</span>
                <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <!-- 创建项目对话框 -->
    <project-form-dialog
      v-model="createDialog"
      :initial-data="editingProject"
      :is-editing="!!editingProject"
      :team-members="teamMembers"
      :team-id="teamId"
      :loading="saving"
      @submit="saveProject"
    />
  </div>
</template>

<script setup lang="ts">
import type { Project, User } from '@/types'

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import ProjectFormDialog from '@/components/projects/forms/ProjectFormDialog.vue'
import { ProjectsApi } from '@/network/api/projects'
import { TeamsApi } from '@/network/api/teams'
import { useDialog } from '@/plugins/dialog'
import { currentUserId } from '@/services/account'

const router = useRouter()
const route = useRoute()
const dialog = useDialog()
const teamId = computed(() => Number(route.params.teamId))

// 项目列表状态
const projects = ref<Project[]>([])
const loading = ref(true)
const teamMembers = ref<User[]>([])

// 筛选状态
const filter = ref({
  leaderId: null as User | null,
})

// 创建/编辑项目状态
const createDialog = ref(false)
const editingProject = ref<Project | null>(null)
const saving = ref(false)

// 删除项目状态
const deleting = ref(false)

// 获取小队项目列表
const fetchProjects = async () => {
  try {
    loading.value = true
    const response = await ProjectsApi.list({
      team_id: teamId.value,
    })
    projects.value = response.data.projects
  } catch (error) {
    console.error('获取项目失败', error)
  } finally {
    loading.value = false
  }
}

// 获取小队成员列表
const fetchTeamMembers = async () => {
  try {
    const response = await TeamsApi.getMembers(teamId.value)
    teamMembers.value = response.data.members.map((member) => member.user)
  } catch (error) {
    console.error('获取小队成员失败', error)
  }
}

// 打开创建项目对话框
const openCreateDialog = () => {
  editingProject.value = null
  createDialog.value = true
}

// 编辑项目
const editProject = (project: Project) => {
  editingProject.value = project
  createDialog.value = true
}

// 保存项目
const saveProject = async (formData: any) => {
  if (!currentUserId.value) {
    return
  }

  try {
    saving.value = true

    if (editingProject.value) {
      await ProjectsApi.update(editingProject.value.id, formData)
    } else {
      await ProjectsApi.create({
        ...formData,
        leaderId: formData.leaderId || currentUserId.value,
      })
    }

    // 刷新项目列表
    await fetchProjects()
    createDialog.value = false
  } catch (error) {
    console.error('保存项目失败', error)
  } finally {
    saving.value = false
  }
}

// 确认删除
const confirmDelete = async (project: Project) => {
  const result = await dialog
    .confirm(`您确定要删除项目 ${project.name} 吗？此操作不可撤销。`, {
      title: '确认删除',
    })
    .wait()

  if (result) {
    await deleteProject(project)
  }
}

// 删除项目
const deleteProject = async (project: Project) => {
  try {
    deleting.value = true
    await ProjectsApi.del(project.id)
    await fetchProjects()
  } catch (error) {
    console.error('删除项目失败', error)
  } finally {
    deleting.value = false
  }
}

// 前往项目详情页
const goToProjectDetail = (projectId: number) => {
  router.push({ name: 'ProjectOverview', params: { projectId: String(projectId) } })
}

// 格式化日期范围
const formatDateRange = (startDate: number, endDate: number) => {
  const start = dayjs(startDate).format('MM/DD')
  const end = dayjs(endDate).format('MM/DD')
  return `${start} - ${end}`
}

// 获取负责人姓名
const getLeaderName = (project: Project) => {
  if (project.leader) return project.leader.nickname
  const leader = teamMembers.value.find((m) => m.id === project.leader?.id)
  return leader ? leader.nickname : '未指定'
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchTeamMembers()])
})

watch(
  () => teamId.value,
  async () => {
    await fetchProjects()
  }
)
</script>

<style scoped lang="scss">
.project-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.project-header {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.project-color-dot {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0.8;
}

.project-letter-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
}

.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.5;
  min-height: 4.5em;
}

.card-hover {
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);

  .view-details-btn {
    opacity: 1;
  }

  .action-btn {
    opacity: 0.8;
  }
}

.view-details-btn {
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateX(2px);
  }
}

.action-btn {
  opacity: 0.5;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.member-avatars {
  display: flex;
  flex-wrap: nowrap;

  .member-avatar {
    border: 2px solid #fff;
    transition: all 0.3s ease;

    &:not(:first-child) {
      margin-left: -8px;
    }
  }

  .more-members {
    background-color: rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.6);
  }
}

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

.empty-state {
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.01);
}

@media (max-width: 600px) {
  .filter-select {
    width: 100%;
  }
}

.color-preset-btn {
  position: relative;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
}

.selected-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.color-preview {
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.text-mono {
  font-family: monospace;
}

.v-color-picker {
  max-width: 100%;
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

/* 骨架屏样式 */
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

.skeleton-card {
  background-color: white !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.skeleton-color-dot {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e0e0;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-letter-avatar,
.skeleton-text-line,
.skeleton-circle {
  position: relative;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.06);
}

.skeleton-letter-avatar::after,
.skeleton-text-line::after,
.skeleton-circle::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 468px 100%;
  animation: shimmer 1.8s infinite linear;
}

.skeleton-letter-avatar {
  width: 38px;
  height: 38px;
  border-radius: 8px;
}

.skeleton-circle {
  border-radius: 50%;
  z-index: 1;
}

.skeleton-circle:nth-child(2) {
  z-index: 2;
  animation-delay: 0.2s;
}

.skeleton-circle:nth-child(3) {
  z-index: 3;
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
}
</style>
