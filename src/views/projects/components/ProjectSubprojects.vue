<template>
  <div class="pa-4 pa-sm-6">
    <!-- 子项目列表顶部操作区 -->
    <div class="d-flex flex-wrap gap-4 align-center mb-4">
      <div class="flex-grow-1">
        <h2 class="text-h6 mb-1">子项目</h2>
        <p class="text-body-2 text-medium-emphasis">将项目分割为多个模块，分配给不同的负责人</p>
      </div>

      <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" class="create-btn" @click="openCreateDialog">
        创建子项目
      </v-btn>
    </div>

    <!-- 子项目列表内容区 -->
    <div v-if="loading">
      <v-skeleton-loader v-for="i in 3" :key="i" type="card" class="mb-4"></v-skeleton-loader>
    </div>

    <div v-else-if="subprojects.length === 0" class="empty-state">
      <div class="text-center py-12">
        <v-icon icon="mdi-view-grid-outline" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
        <h3 class="text-h6 font-weight-medium mb-2">暂无子项目</h3>
        <p class="text-body-2 text-medium-emphasis mb-6">
          为您的项目创建子项目，将工作分解为较小的模块，并分配给团队成员
        </p>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">创建子项目</v-btn>
      </div>
    </div>

    <v-row v-else>
      <v-col v-for="subproject in subprojects" :key="subproject.id" cols="12" sm="6" md="4">
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            class="subproject-card fill-height"
            rounded="lg"
            :class="isHovering ? 'card-hover' : ''"
            @click="goToSubproject(subproject.id)"
          >
            <!-- 顶部区域 -->
            <div class="subproject-header">
              <div class="subproject-color-dot" :style="{ backgroundColor: subproject.colorCode }"></div>
              <div class="d-flex align-center px-4 py-3">
                <div class="subproject-letter-avatar mr-3">
                  <span>{{ subproject.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="text-subtitle-1 font-weight-medium text-truncate mb-0">{{ subproject.name }}</p>
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
                    <v-list-item @click.stop="editSubproject(subproject)">
                      <template #prepend>
                        <v-icon size="small">mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>编辑</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click.stop="confirmDelete(subproject)">
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
              <p class="text-body-2 description-text">{{ subproject.description }}</p>

              <div class="d-flex align-center mt-4">
                <v-icon size="16" color="grey-darken-1" class="mr-2">mdi-account</v-icon>
                <span class="text-body-2">{{ subproject.leader?.nickname || '未指定负责人' }}</span>
              </div>
            </v-card-text>

            <!-- 底部区域 -->
            <v-card-actions class="pa-4 pt-0">
              <div class="member-avatars">
                <v-avatar
                  v-for="member in subproject.members.examples.slice(0, 3)"
                  :key="member.id"
                  size="28"
                  class="member-avatar"
                >
                  <v-img :src="getAvatarUrl(member.user.avatarId)" />
                </v-avatar>
                <v-avatar v-if="subproject.members.count > 3" size="28" class="member-avatar more-members">
                  <span class="text-caption">+{{ subproject.members.count - 3 }}</span>
                </v-avatar>
              </div>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                size="small"
                color="primary"
                :ripple="false"
                class="view-details-btn"
                @click.stop="goToSubproject(subproject.id)"
              >
                <span class="text-none">查看详情</span>
                <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <!-- 创建/编辑子项目对话框 -->
    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card rounded="lg">
        <v-card-title class="px-4 pt-4 pb-2">
          <span class="text-h6">{{ editingProject ? '编辑子项目' : '创建子项目' }}</span>
        </v-card-title>
        <v-card-text class="px-4">
          <v-form ref="formEl" @submit.prevent="saveSubproject">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.name"
                  label="子项目名称"
                  variant="outlined"
                  density="comfortable"
                  required
                  :rules="[(v) => !!v || '项目名称不能为空']"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="子项目描述"
                  variant="outlined"
                  rows="3"
                  auto-grow
                  counter
                  required
                  :rules="[(v) => !!v || '项目描述不能为空']"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <label class="text-subtitle-2 mb-2 d-block">
                  子项目标签颜色 <span class="text-caption text-medium-emphasis">(用于快速区分)</span>
                </label>
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <v-btn
                    v-for="color in projectColors"
                    :key="color"
                    variant="outlined"
                    :style="{
                      borderColor: color,
                      backgroundColor: form.colorCode === color ? `${color}10` : 'transparent',
                    }"
                    size="small"
                    class="color-select-btn"
                    @click="form.colorCode = color"
                  >
                    <div class="color-dot mr-1" :style="{ backgroundColor: color }"></div>
                    <span v-if="form.colorCode === color" class="text-caption">已选</span>
                  </v-btn>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <v-date-input v-model="startDate" label="开始日期" prepend-icon="" variant="outlined"></v-date-input>
              </v-col>

              <v-col cols="12" md="6">
                <v-date-input v-model="endDate" label="结束日期" prepend-icon="" variant="outlined"></v-date-input>
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="form.leaderId"
                  label="负责人"
                  variant="outlined"
                  density="comfortable"
                  :items="teamMembers"
                  item-title="nickname"
                  item-value="id"
                  return-object
                  clearable
                >
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-avatar size="32">
                          <v-img :src="getAvatarUrl(item.raw.avatarId)" />
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.nickname }}</v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">取消</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveSubproject">
            {{ editingProject ? '保存修改' : '创建子项目' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="px-4 pt-4">确认删除</v-card-title>
        <v-card-text class="px-4">
          您确定要删除子项目 <strong>{{ projectToDelete?.name }}</strong> 吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">取消</v-btn>
          <v-btn color="error" variant="tonal" :loading="deleting" @click="deleteSubproject">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Project, User } from '@/types'

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { VForm } from 'vuetify/lib/components/index.mjs'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import { ProjectsApi } from '@/network/api/projects'
import { TeamsApi } from '@/network/api/teams'
import { currentUserId } from '@/services/account'

const props = defineProps<{
  parentProject: Project | null
  subprojects: Project[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const router = useRouter()
const loading = ref(false)
const teamMembers = ref<User[]>([])

// 子项目操作状态
const dialog = ref(false)
const editingProject = ref<Project | null>(null)
const formEl = ref<InstanceType<typeof VForm> | null>(null)
const form = ref({
  name: '',
  description: '',
  colorCode: '#6366f1',
  teamId: 0,
  leaderId: null as User | null,
  parentId: 0,
})
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const saving = ref(false)

// 删除状态
const deleteDialog = ref(false)
const projectToDelete = ref<Project | null>(null)
const deleting = ref(false)

// 项目颜色选项 - 更柔和的色彩
const projectColors = [
  '#6366f1', // 主题蓝
  '#818cf8', // 淡蓝色
  '#8b5cf6', // 淡紫色
  '#14b8a6', // 蓝绿色
  '#10b981', // 翠绿色
  '#60a5fa', // 天蓝色
  '#f59e0b', // 琥珀色
  '#f97316', // 橙色 (主题色)
  '#ef4444', // 红色
  '#ec4899', // 粉红色
]

// 获取小队成员列表
const fetchTeamMembers = async () => {
  if (!props.parentProject?.team.id) return

  try {
    const response = await TeamsApi.getMembers(props.parentProject?.team.id)
    teamMembers.value = response.data.members.map((member) => member.user)
  } catch (error) {
    console.error('获取小队成员失败', error)
  }
}

// 打开创建对话框
const openCreateDialog = () => {
  if (!props.parentProject) return

  editingProject.value = null
  form.value = {
    name: '',
    description: '',
    colorCode: '#6366f1',
    teamId: props.parentProject.team.id,
    leaderId: null,
    parentId: props.parentProject.id,
  }
  startDate.value = dayjs().startOf('day').toDate()
  endDate.value = dayjs().add(7, 'day').endOf('day').toDate()
  dialog.value = true
}

// 编辑子项目
const editSubproject = (project: Project) => {
  editingProject.value = project

  // 查找负责人对象
  const leader = teamMembers.value.find((m) => m.id === project.leader.id)

  form.value = {
    name: project.name,
    description: project.description,
    colorCode: project.colorCode,
    teamId: project.team.id,
    leaderId: leader || null,
    parentId: project.parentId || 0,
  }
  startDate.value = dayjs(project.startDate).toDate()
  endDate.value = dayjs(project.endDate).toDate()
  dialog.value = true
}

// 保存子项目
const saveSubproject = async () => {
  if (!formEl.value) return
  const valid = await formEl.value.validate()

  if (!valid.valid) return

  try {
    saving.value = true

    const formData: any = {
      name: form.value.name,
      description: form.value.description,
      colorCode: form.value.colorCode,
      startDate: startDate.value ? new Date(startDate.value).getTime() : undefined,
      endDate: endDate.value ? new Date(endDate.value).getTime() : undefined,
      teamId: form.value.teamId,
      leaderId: form.value.leaderId?.id,
      parentId: form.value.parentId,
    }

    if (editingProject.value) {
      await ProjectsApi.update(editingProject.value.id, formData)
    } else {
      await ProjectsApi.create(formData)
    }

    // 刷新子项目列表
    emit('refresh')
    dialog.value = false
  } catch (error) {
    console.error('保存子项目失败', error)
  } finally {
    saving.value = false
  }
}

// 确认删除
const confirmDelete = (project: Project) => {
  projectToDelete.value = project
  deleteDialog.value = true
}

// 删除子项目
const deleteSubproject = async () => {
  if (!projectToDelete.value) return

  try {
    deleting.value = true
    await ProjectsApi.del(projectToDelete.value.id)
    emit('refresh')
    deleteDialog.value = false
    projectToDelete.value = null
  } catch (error) {
    console.error('删除子项目失败', error)
  } finally {
    deleting.value = false
  }
}

// 前往子项目详情页
const goToSubproject = (projectId: number) => {
  router.push({ name: 'ProjectDetail', params: { projectId: String(projectId) } })
}

onMounted(() => {
  fetchTeamMembers()
})
</script>

<style scoped lang="scss">
.empty-state {
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.01);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

.create-btn {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.subproject-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.subproject-header {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.subproject-color-dot {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0.8;
}

.subproject-letter-avatar {
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

@media (max-width: 600px) {
  .create-btn {
    width: 100%;
  }
}
</style>
