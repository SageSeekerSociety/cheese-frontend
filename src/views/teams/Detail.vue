<template>
  <DetailSidebar
    v-model:show-archived-channels="showArchivedChannels"
    :team-data="teamData"
    :team-members="teamMembers"
    :team-members-count="teamMembersCount"
    :projects="projects"
    :loading="loading"
    :expanded-channels="expandedChannels"
    @open-create-channel-dialog="openCreateChannelDialog"
    @handle-create-sub-channel="handleCreateSubChannel"
    @toggle-channel-expand="toggleChannelExpand"
  />
  <v-container fluid class="pa-0 layout-container">
    <v-row no-gutters class="fill-height">
      <!-- 右侧内容区 -->
      <v-col>
        <v-sheet class="h-100 d-flex flex-column" rounded="lg">
          <!-- 顶部操作栏 -->
          <div class="content-header px-6 py-3 d-flex align-center">
            <!-- 如果是讨论详情页，使用DiscussionHeader组件 -->
            <router-view v-if="isDiscussionDetailRoute" name="header"></router-view>
            <template v-else>
              <div class="d-flex align-center">
                <div v-if="activeTab === 'TeamsDetailChannels' && currentChannel" class="d-flex align-center">
                  <div class="channel-dot mr-2" :style="{ backgroundColor: currentChannel.colorCode }"></div>
                  <h2 class="text-h6 font-weight-medium">{{ currentChannel?.name }}</h2>
                  <v-chip v-if="currentChannel?.archived" size="small" class="ml-2" color="grey" variant="tonal">
                    已归档
                  </v-chip>
                </div>
                <div v-else-if="activeTab === 'TeamsDetailMembers'" class="d-flex align-center">
                  <v-icon icon="mdi-account-group" class="mr-2"></v-icon>
                  <h2 class="text-h6 font-weight-medium">成员管理</h2>
                </div>
                <div v-else-if="activeTab === 'TeamsDetailKnowledge'" class="d-flex align-center">
                  <v-icon icon="mdi-book-open-page-variant" class="mr-2"></v-icon>
                  <h2 class="text-h6 font-weight-medium">知识库</h2>
                </div>
              </div>

              <v-spacer></v-spacer>

              <!-- 频道相关操作按钮 -->
              <div
                v-if="activeTab === 'TeamsDetailChannels' && currentChannel && isTeamAdmin"
                class="d-flex align-center"
              >
                <v-btn
                  v-if="!currentChannel.archived"
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-pencil"
                  @click="editChannel(currentChannel)"
                >
                  编辑频道
                </v-btn>
                <v-btn
                  v-if="!currentChannel.archived"
                  variant="text"
                  color="grey"
                  size="small"
                  prepend-icon="mdi-archive-outline"
                  @click="archiveChannel(currentChannel)"
                >
                  归档
                </v-btn>
                <v-btn
                  v-if="currentChannel.archived"
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-archive-arrow-up-outline"
                  @click="unarchiveChannel(currentChannel)"
                >
                  取消归档
                </v-btn>
              </div>
            </template>
          </div>

          <v-divider></v-divider>

          <!-- 主内容区 -->
          <div class="content-body overflow-auto">
            <router-view />
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- 创建频道对话框 -->
    <project-form-dialog
      v-model="createChannelDialog"
      :initial-data="editingChannel"
      :is-editing="!!editingChannel"
      :team-members="teamMembers"
      :team-id="teamId"
      :loading="saving"
      :parent-channel-id="parentChannelId"
      :available-parent-channels="parentActiveProjects"
      :dialog-subtitle="getDialogSubtitle()"
      @submit="saveChannel"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { Project, Team, User } from '@/types'

import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getAvatarUrl } from '@/utils/materials'

import DetailSidebar from './DetailSidebar.vue'

import ProjectFormDialog from '@/components/projects/forms/ProjectFormDialog.vue'
import { teamDataInjectionKey } from '@/keys'
import { ProjectsApi } from '@/network/api/projects'
import { TeamsApi } from '@/network/api/teams'
import { useDialog } from '@/plugins/dialog'
import AccountService from '@/services/account'
import { useDiscussionStore } from '@/stores/discussionStore'

const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const discussionStore = useDiscussionStore()
const teamData = ref<Team>()
provide(teamDataInjectionKey, teamData)

const teamId = computed(() => Number(route.params.teamId))
const activeTab = ref<string | null>(null)
const teamMembers = ref<User[]>([])
const teamMembersCount = ref(0)
const projects = ref<Project[]>([])
const loading = ref(true)
const saving = ref(false)

const createChannelDialog = ref(false)
const editingChannel = ref<Project | null>(null)

const parentChannelId = ref<number | null>(null)

const activeChannelId = computed(() => {
  const channelId = route.params.channelId
  if (channelId) {
    return Number(channelId)
  }

  return null
})

const currentChannel = computed(() => {
  const channelId = activeChannelId.value
  if (!channelId) return null

  const directMatch = projects.value.find((project) => project.id === channelId)
  if (directMatch) return directMatch

  for (const project of projects.value) {
    if (project.children) {
      const childMatch = project.children.find((child) => child.id === channelId)
      if (childMatch) return childMatch
    }
  }

  return null
})

const isTeamAdmin = computed(() => {
  if (!teamData.value || !AccountService.user) {
    return false
  }

  if (teamData.value.owner.id === AccountService.user.id) {
    return true
  }

  const isAdmin = teamData.value.admins.examples?.some((admin) => admin.id === AccountService.user?.id)

  return !!isAdmin
})

watch(
  () => route.name,
  (newRouteName) => {
    activeTab.value = newRouteName as string
  },
  { immediate: true }
)

// 监听路由query参数变化，确保频道切换时UI正确更新
watch(
  () => route.query.channelId,
  (newChannelId) => {
    discussionStore.clearCurrentDiscussion()

    if (newChannelId) {
      const channelId = Number(newChannelId)
      discussionStore.loadDiscussionsByChannel(channelId)

      for (const project of projects.value) {
        if (project.children && project.children.some((child) => child.id === channelId)) {
          expandedChannels.value[project.id] = true
          break
        }
      }
    }
  },
  { immediate: true }
)

const fetchTeamData = async (teamId: number) => {
  const {
    data: { team },
  } = await TeamsApi.detail(teamId)
  teamData.value = team
}

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

const fetchTeamMembers = async () => {
  try {
    const response = await TeamsApi.getMembers(teamId.value)
    teamMembers.value = response.data.members.map((member) => member.user)
    teamMembersCount.value = response.data.members.length
  } catch (error) {
    console.error('获取小队成员失败', error)
  }
}

const openCreateChannelDialog = (parentId?: number) => {
  editingChannel.value = null
  if (parentId) {
    parentChannelId.value = parentId
    createChannelDialog.value = true
  } else {
    parentChannelId.value = null
    createChannelDialog.value = true
  }
}

const editChannel = (channel: Project) => {
  editingChannel.value = channel
  createChannelDialog.value = true
}

const saveChannel = async (formData: Record<string, any>) => {
  if (!AccountService.user?.id) {
    return
  }

  try {
    saving.value = true

    const finalFormData = {
      ...formData,
      leaderId: formData.leaderId || AccountService.user.id,
    }

    let savedProject: Project
    if (editingChannel.value) {
      const response = await ProjectsApi.update(editingChannel.value.id, finalFormData)
      savedProject = response.data.project
    } else {
      const response = await ProjectsApi.create(finalFormData)
      savedProject = response.data.project
    }

    await fetchProjects()
    createChannelDialog.value = false
    parentChannelId.value = null

    if (formData.parentId) {
      expandedChannels.value[formData.parentId] = true
    }

    router.replace({
      name: 'TeamsDetailChannels',
      params: { ...route.params },
      query: { ...route.query, channelId: String(savedProject.id) },
    })
  } catch (error) {
    console.error('保存频道失败', error)
  } finally {
    saving.value = false
  }
}

const archiveChannel = async (channel: Project) => {
  const isParentChannel = !channel.parentId

  let confirmMessage = `您确定要归档频道 ${channel.name} 吗？`
  if (isParentChannel && hasChildren(channel)) {
    confirmMessage += `\n\n注意：归档父频道将同时归档其下所有子频道。`
  }
  confirmMessage += `\n归档后可以随时恢复。`

  const result = await dialog
    .confirm(confirmMessage, {
      title: '归档频道',
    })
    .wait()

  if (result) {
    try {
      await ProjectsApi.update(channel.id, { archived: true })

      if (isParentChannel && channel.children && channel.children.length > 0) {
        const childArchivePromises = channel.children.map((child) => ProjectsApi.update(child.id, { archived: true }))

        await Promise.all(childArchivePromises)
      }

      await fetchProjects()

      if (isParentChannel && hasChildren(channel)) {
        dialog.alert(`频道 ${channel.name} 及其子频道已归档`, { title: '成功' })
      } else {
        dialog.alert(`频道 ${channel.name} 已归档`, { title: '成功' })
      }

      const activeProjects = projects.value.filter((project) => !project.archived)
      if (activeChannelId.value === channel.id && activeProjects.length > 0) {
        router.replace({
          ...route,
          query: { ...route.query, channelId: String(activeProjects[0].id) },
        })
      }
    } catch (error) {
      console.error('归档频道失败', error)
      dialog.alert('归档频道失败，请重试', { title: '错误' })
    }
  }
}

const unarchiveChannel = async (channel: Project) => {
  const isParentChannel = !channel.parentId

  let confirmMessage = `您确定要取消归档频道 ${channel.name} 吗？`
  if (isParentChannel && hasChildren(channel)) {
    confirmMessage += `\n\n注意：取消归档父频道将同时取消归档其下所有子频道。`
  }

  const result = await dialog
    .confirm(confirmMessage, {
      title: '取消归档频道',
    })
    .wait()

  if (!result) return

  try {
    await ProjectsApi.update(channel.id, { archived: false })

    if (isParentChannel && channel.children && channel.children.length > 0) {
      const childUnarchivePromises = channel.children.map((child) => ProjectsApi.update(child.id, { archived: false }))

      await Promise.all(childUnarchivePromises)
    }

    await fetchProjects()

    if (isParentChannel && hasChildren(channel)) {
      dialog.alert(`频道 ${channel.name} 及其子频道已取消归档`, { title: '成功' })
    } else {
      dialog.alert(`频道 ${channel.name} 已取消归档`, { title: '成功' })
    }
  } catch (error) {
    console.error('取消归档频道失败', error)
    dialog.alert('取消归档频道失败，请重试', { title: '错误' })
  }
}

const expandedChannels = ref<Record<number, boolean>>({})

const hasChildren = (project: Project) => {
  return project.children && project.children.filter((child) => !child.archived).length > 0
}

const toggleChannelExpand = (channelId: number) => {
  expandedChannels.value[channelId] = !expandedChannels.value[channelId]
}

const handleCreateSubChannel = (parentId: number) => {
  openCreateChannelDialog(parentId)
}

provide('discussionData', {
  currentMessage: computed(() => discussionStore.currentDiscussion),
  isCurrentUserMessage: computed(() => {
    const currentMessage = discussionStore.currentDiscussion
    return currentMessage && currentMessage.sender.id === AccountService.user?.id
  }),
  channelName: computed(() => (route.query.channelName as string) || '讨论详情'),
  goBack: () => router.back(),
})

const isDiscussionDetailRoute = computed(() => {
  return route.name === 'TeamsDetailDiscussion' || (route.meta && route.meta.isDiscussionDetail === true)
})

const showArchivedChannels = ref(true) // 默认展开

// 获取对话框副标题
const getDialogSubtitle = () => {
  if (editingChannel.value) {
    return '修改频道信息'
  }

  if (parentChannelId.value) {
    const parentActiveProjects = projects.value.filter((project) => !project.archived && !project.parentId)
    const parentChannel = parentActiveProjects.find((p) => p.id === parentChannelId.value)
    return `在 ${parentChannel?.name || '父频道'} 下创建子频道`
  }

  return '创建新的顶级频道'
}

onMounted(async () => {
  const teamId = Number(route.params.teamId)
  await Promise.all([fetchTeamData(teamId), fetchProjects(), fetchTeamMembers()])
})
</script>

<style scoped lang="scss">
.layout-container {
  height: calc(100vh - var(--v-layout-top) - 1px);
  overflow: hidden;
}

.sidebar-col {
  height: 100%;
  overflow-y: auto;
  top: var(--v-layout-top);
  left: 0;
  width: 16.666667%; /* 对应 lg="2" */
}

.content-col {
  background-color: rgba(0, 0, 0, 0.02);
  height: 100%;
  overflow-y: auto;
}

@media (min-width: 960px) and (max-width: 1264px) {
  .sidebar-col {
    width: 25%; /* 对应 md="3" */
  }

  .content-col {
    margin-left: 25%;
    width: 75%; /* 对应 md="9" */
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .sidebar-col {
    width: 33.333333%; /* 对应 sm="4" */
  }

  .content-col {
    margin-left: 33.333333%;
    width: 66.666667%; /* 对应 sm="8" */
  }
}

@media (max-width: 599px) {
  .sidebar-col {
    position: relative;
    width: 100%;
    height: auto;
    overflow: hidden;
  }

  .content-col {
    margin-left: 0;
    width: 100%;
    height: auto;
  }
}

.sidebar-card {
  border-radius: 0;
  background-color: white;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.team-header {
  transition: all 0.3s ease;
}

.team-avatar {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 2px solid white;
}

.team-name {
  font-weight: 500;
  line-height: 1.2;
}

.channels-header {
  transition: opacity 0.2s ease;
  margin-bottom: 8px;
}

.channel-item {
  transition: all 0.2s ease;
  height: 36px;
  margin-bottom: 2px;
  opacity: 0.85;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.active-channel {
  background-color: rgba(var(--v-theme-primary), 0.08);
  font-weight: 500;
  opacity: 1;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.12);
  }
}

.archived-channel {
  opacity: 0.6;
}

.channel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.archive-header {
  border-radius: 8px;
  transition: background-color 0.2s ease;
  cursor: pointer;
  margin: 2px 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.archive-list {
  margin-top: 2px;
}

.empty-channels-state {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 16px;
  margin: 8px 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.function-item {
  height: 36px;
  margin-bottom: 2px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.content-sheet {
  overflow: hidden;
}

.content-header {
  min-height: 60px;
}

.content-body {
  flex: 1;
  overflow-y: auto;
}

.admin-avatars {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;

  .admin-avatar {
    border: 2px solid #fff;
    transition: all 0.3s ease;
  }

  .admin-avatar:not(:first-child) {
    margin-left: -8px;
  }

  &:hover {
    overflow: visible;

    .admin-avatar:not(:first-child) {
      margin-left: 4px;
    }
  }

  .admin-avatar:nth-child(1) {
    z-index: 10;
  }
  .admin-avatar:nth-child(2) {
    z-index: 9;
  }
  .admin-avatar:nth-child(3) {
    z-index: 8;
  }
}

// 响应式调整
@media (max-width: 960px) {
  .sidebar-col {
    height: auto;
    max-height: none;
    overflow: visible;
    position: relative;
    top: 0;
    width: 100%;
  }

  .content-col {
    height: auto;
    margin-left: 0;
    width: 100%;
    overflow: visible;
  }

  .content-sheet {
    margin: 8px;
    height: auto;
  }

  .layout-container {
    height: auto;
    overflow: visible;
  }
}

// 针对小型设备的顶栏高度调整（通常顶栏在小屏幕上高度为56px）
@media (max-width: 600px) {
  .layout-container {
    height: calc(100vh - 56px);
  }

  .sidebar-col {
    top: 56px;
    height: calc(100vh - 56px);
  }

  .content-col {
    height: calc(100vh - 56px);
  }

  .content-sheet {
    height: calc(100vh - 56px - 16px);
  }
}

.child-channels {
  margin-top: -2px;
  margin-bottom: 4px;
  transition: all 0.25s ease;
  overflow: hidden;
}

.child-channel-item {
  height: 32px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 0;
    width: 1px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateX(-50%);
  }
}

.child-channel-dot {
  width: 6px;
  height: 6px;
  opacity: 0.8;
}

.expand-icon {
  opacity: 0.6;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 50%;
  }
}

.create-subitem-btn {
  opacity: 0;
  transition: opacity 0.2s ease;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
}

.channel-item:hover .create-subitem-btn {
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}
</style>
