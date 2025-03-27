<template>
  <v-container fluid class="pa-0 layout-container">
    <v-row no-gutters class="fill-height">
      <!-- 左侧边栏 -->
      <v-col cols="12" sm="4" md="3" lg="2" class="sidebar-col">
        <v-card class="sidebar-card fill-height" flat rounded="0">
          <!-- 小队信息头部 -->
          <div class="team-header pa-4">
            <div class="d-flex align-center mb-4">
              <v-avatar size="48" color="primary" class="team-avatar">
                <v-img :src="getAvatarUrl(teamData?.avatarId)" />
              </v-avatar>
              <div class="ml-3">
                <div class="text-h6 team-name">{{ teamData?.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ teamData?.intro }}</div>
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- 频道管理 -->
          <div class="px-2 pt-4 pb-2">
            <div class="d-flex align-center justify-space-between channels-header px-2">
              <span class="text-subtitle-2 font-weight-medium">频道</span>
              <v-btn
                v-if="isTeamAdmin"
                icon="mdi-plus"
                variant="text"
                size="small"
                density="comfortable"
                @click="openCreateChannelDialog()"
              ></v-btn>
            </div>

            <!-- 活跃频道列表 -->
            <v-list density="compact" nav>
              <!-- 将项目作为频道显示 - 仅显示父频道 -->
              <template v-for="project in parentActiveProjects" :key="project.id">
                <!-- 父频道项 -->
                <v-list-item
                  :value="project.id"
                  :to="{ name: 'TeamsDetailChannels', params: { ...route.params, channelId: project.id } }"
                  :active="activeChannelId === project.id"
                  rounded="lg"
                  class="channel-item mb-1"
                  color="primary"
                >
                  <template #prepend>
                    <div class="channel-dot mr-2" :style="{ backgroundColor: project.colorCode }"></div>
                  </template>
                  <v-list-item-title class="text-body-2">{{ project.name }}</v-list-item-title>
                  <template #append>
                    <div class="d-flex align-center">
                      <v-badge
                        v-if="getUnreadCount(project.id) > 0"
                        :content="getUnreadCount(project.id)"
                        color="primary"
                        dot
                        floating
                        class="mr-1"
                      ></v-badge>
                      <!-- 添加创建子频道按钮 -->
                      <v-btn
                        v-if="isTeamAdmin && !project.archived"
                        icon="mdi-plus-circle-outline"
                        variant="text"
                        size="x-small"
                        density="comfortable"
                        class="create-subitem-btn mr-1"
                        title="创建子频道"
                        @click.stop.prevent="handleCreateSubChannel(project.id)"
                      ></v-btn>
                      <!-- 显示子频道指示器 -->
                      <v-icon
                        v-if="hasChildren(project)"
                        size="small"
                        :icon="expandedChannels[project.id] ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                        class="ml-1 expand-icon"
                        @click.stop.prevent="toggleChannelExpand(project.id)"
                      ></v-icon>
                    </div>
                  </template>
                </v-list-item>

                <!-- 子频道 -->
                <div v-if="hasChildren(project) && expandedChannels[project.id]" class="child-channels ml-4">
                  <v-list-item
                    v-for="child in project.children.filter((child) => !child.archived)"
                    :key="child.id"
                    :value="child.id"
                    :to="{ name: 'TeamsDetailChannels', params: { ...route.params, channelId: child.id } }"
                    :active="activeChannelId === child.id"
                    rounded="lg"
                    class="channel-item child-channel-item mb-1"
                    color="primary"
                    density="comfortable"
                  >
                    <template #prepend>
                      <div
                        class="channel-dot child-channel-dot mr-2"
                        :style="{ backgroundColor: child.colorCode }"
                      ></div>
                    </template>
                    <v-list-item-title class="text-body-2">{{ child.name }}</v-list-item-title>
                    <template #append>
                      <v-badge
                        v-if="getUnreadCount(child.id) > 0"
                        :content="getUnreadCount(child.id)"
                        color="primary"
                        dot
                        floating
                      ></v-badge>
                    </template>
                  </v-list-item>
                </div>
              </template>

              <!-- 空状态提示 -->
              <div v-if="!loading && activeProjects.length === 0" class="empty-channels-state pa-4 text-center">
                <v-icon icon="mdi-message-text-outline" size="large" color="grey-lighten-1" class="mb-2"></v-icon>
                <div class="text-body-2 text-medium-emphasis mb-1">暂无频道</div>
                <div class="text-caption text-grey">创建频道开始团队协作</div>
                <v-btn
                  v-if="isTeamAdmin"
                  color="primary"
                  variant="tonal"
                  size="small"
                  class="mt-3"
                  prepend-icon="mdi-plus"
                  @click="openCreateChannelDialog()"
                >
                  创建频道
                </v-btn>
              </div>
            </v-list>

            <!-- 归档频道 -->
            <div v-if="allArchivedProjects.length > 0" class="mt-2">
              <!-- 归档频道标题栏 -->
              <div
                class="archive-header d-flex align-center px-2 py-1"
                @click="showArchivedChannels = !showArchivedChannels"
              >
                <span class="text-caption text-medium-emphasis">已归档频道</span>
                <v-spacer></v-spacer>
                <v-icon
                  size="x-small"
                  class="text-medium-emphasis"
                  :icon="showArchivedChannels ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                ></v-icon>
              </div>

              <!-- 可展开的归档频道列表 -->
              <v-expand-transition>
                <div v-show="showArchivedChannels">
                  <v-list density="compact" nav class="archive-list pa-2">
                    <!-- 所有归档频道平铺显示 -->
                    <v-list-item
                      v-for="project in allArchivedProjects"
                      :key="project.id"
                      :value="project.id"
                      :to="{ name: 'TeamsDetailChannels', params: { ...route.params, channelId: project.id } }"
                      :active="activeChannelId === project.id"
                      rounded="lg"
                      class="channel-item archived-channel mb-1"
                    >
                      <template #prepend>
                        <div class="channel-dot mr-2" :style="{ backgroundColor: project.colorCode }"></div>
                        <!-- 如果是子频道，显示标识 -->
                        <v-icon v-if="project.parentId" size="x-small" class="mr-1 text-medium-emphasis">
                          mdi-subdirectory-arrow-right
                        </v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">{{ project.name }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>
              </v-expand-transition>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- 小队功能区 -->
          <div class="px-2 pt-2">
            <v-list density="compact" nav>
              <v-list-item
                :to="{ name: 'TeamsDetailMembers', params: route.params }"
                prepend-icon="mdi-account-group"
                rounded="lg"
                class="function-item"
              >
                <v-list-item-title>成员管理</v-list-item-title>
                <template #append>
                  <v-chip size="x-small" color="primary" variant="tonal" class="ml-2">
                    {{ teamMembersCount }}
                  </v-chip>
                </template>
              </v-list-item>

              <v-list-item
                :to="{ name: 'TeamsDetailKnowledge', params: route.params }"
                prepend-icon="mdi-book-open-page-variant"
                rounded="lg"
                class="function-item"
              >
                <v-list-item-title>知识库</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>

          <!-- 管理员信息 -->
          <v-divider class="my-2"></v-divider>
          <div class="team-admins px-4 pt-2 pb-4">
            <p class="text-caption text-medium-emphasis mb-2">管理员</p>
            <div class="d-flex align-center">
              <div class="admin-avatars">
                <v-avatar
                  v-for="admin in ownerAndAdminExamples"
                  :key="admin.id"
                  size="28"
                  color="grey-lighten-2"
                  class="admin-avatar"
                >
                  <v-img :src="getAvatarUrl(admin.avatarId)" />
                </v-avatar>
              </div>
              <div class="text-caption text-medium-emphasis ml-2">{{ ownerAndAdminsText }}</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- 右侧内容区 -->
      <v-col cols="12" sm="8" md="9" lg="10" class="content-col">
        <v-sheet class="content-sheet d-flex flex-column ma-3" rounded="lg">
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
      @submit="saveChannel"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { Project, Team, User } from '@/types'

import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getAvatarUrl } from '@/utils/materials'

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

// 创建/编辑频道状态
const createChannelDialog = ref(false)
const editingChannel = ref<Project | null>(null)

// 存储创建子频道时的父频道ID
const parentChannelId = ref<number | null>(null)

// 活跃和归档频道(项目)
const activeProjects = computed(() => projects.value.filter((project) => !project.archived))

// 当前选中的频道
const activeChannelId = computed(() => {
  const channelId = route.params.channelId
  // 如果URL中有channelId，则使用它
  if (channelId) {
    return Number(channelId)
  }

  // 否则默认使用第一个活跃频道
  if (activeProjects.value.length > 0) {
    return activeProjects.value[0].id
  }

  return null
})

const currentChannel = computed(() => {
  const channelId = activeChannelId.value
  if (!channelId) return null

  // 在所有项目中查找
  const directMatch = projects.value.find((project) => project.id === channelId)
  if (directMatch) return directMatch

  // 如果没找到，在子频道中查找
  for (const project of projects.value) {
    if (project.children) {
      const childMatch = project.children.find((child) => child.id === channelId)
      if (childMatch) return childMatch
    }
  }

  return null
})

// 是否为小队管理员或创建者
const isTeamAdmin = computed(() => {
  if (!teamData.value || !AccountService.user) {
    return false
  }

  // 是创建者
  if (teamData.value.owner.id === AccountService.user.id) {
    return true
  }

  // 是管理员
  const isAdmin = teamData.value.admins.examples?.some((admin) => admin.id === AccountService.user?.id)

  return !!isAdmin
})

// 在路由改变时更新activeTab
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
    // 重置讨论状态
    discussionStore.clearCurrentDiscussion()

    // 如果有新的频道ID，加载这个频道的讨论列表
    if (newChannelId) {
      const channelId = Number(newChannelId)
      // 确保讨论列表重新加载
      discussionStore.loadDiscussionsByChannel(channelId)

      // 查找此频道是否是某个父频道的子频道
      for (const project of projects.value) {
        if (project.children && project.children.some((child) => child.id === channelId)) {
          // 如果是子频道，确保父频道展开
          expandedChannels.value[project.id] = true
          break
        }
      }
    }
  },
  { immediate: true }
)

// 模拟获取未读消息数
const getUnreadCount = (channelId: number) => {
  // 这里应该通过API获取真实的未读消息数
  // 现在先模拟一些数据
  const counts: Record<number, number> = {}
  return counts[channelId] || 0
}

// 获取小队数据
const fetchTeamData = async (teamId: number) => {
  const {
    data: { team },
  } = await TeamsApi.detail(teamId)
  teamData.value = team
}

// 获取小队项目(作为频道)
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

// 获取小队成员
const fetchTeamMembers = async () => {
  try {
    const response = await TeamsApi.getMembers(teamId.value)
    teamMembers.value = response.data.members.map((member) => member.user)
    teamMembersCount.value = response.data.members.length
  } catch (error) {
    console.error('获取小队成员失败', error)
  }
}

// 打开创建频道对话框
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

// 编辑频道
const editChannel = (channel: Project) => {
  editingChannel.value = channel
  createChannelDialog.value = true
}

// 保存频道
const saveChannel = async (formData: any) => {
  if (!AccountService.user?.id) {
    return
  }

  try {
    saving.value = true

    // 确保leaderId有效
    const finalFormData = {
      ...formData,
      leaderId: formData.leaderId || AccountService.user.id,
    }

    if (editingChannel.value) {
      await ProjectsApi.update(editingChannel.value.id, finalFormData)
    } else {
      await ProjectsApi.create(finalFormData)
    }

    // 刷新项目列表
    await fetchProjects()
    createChannelDialog.value = false
    // 重置父频道ID
    parentChannelId.value = null

    // 如果创建的是子频道，确保父频道展开显示
    if (formData.parentId) {
      expandedChannels.value[formData.parentId] = true
    }
  } catch (error) {
    console.error('保存频道失败', error)
  } finally {
    saving.value = false
  }
}

// 归档频道
const archiveChannel = async (channel: Project) => {
  // 确定是主频道还是子频道
  const isParentChannel = !channel.parentId

  // 添加提示信息
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
      // 调用API归档频道
      await ProjectsApi.update(channel.id, { archived: true })

      // 如果是父频道，同时归档所有子频道
      if (isParentChannel && channel.children && channel.children.length > 0) {
        // 创建子频道归档的Promise数组
        const childArchivePromises = channel.children.map((child) => ProjectsApi.update(child.id, { archived: true }))

        // 等待所有子频道归档完成
        await Promise.all(childArchivePromises)
      }

      // 刷新项目列表以获取最新状态
      await fetchProjects()

      // 显示成功消息
      if (isParentChannel && hasChildren(channel)) {
        dialog.alert(`频道 ${channel.name} 及其子频道已归档`, { title: '成功' })
      } else {
        dialog.alert(`频道 ${channel.name} 已归档`, { title: '成功' })
      }

      // 如果当前选中的是被归档的频道，切换到第一个活跃频道
      if (activeChannelId.value === channel.id && activeProjects.value.length > 0) {
        router.replace({
          ...route,
          query: { ...route.query, channelId: String(activeProjects.value[0].id) },
        })
      }
    } catch (error) {
      console.error('归档频道失败', error)
      dialog.alert('归档频道失败，请重试', { title: '错误' })
    }
  }
}

// 取消归档频道
const unarchiveChannel = async (channel: Project) => {
  // 确定是主频道还是子频道
  const isParentChannel = !channel.parentId

  // 添加提示信息
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
    // 调用API取消归档频道
    await ProjectsApi.update(channel.id, { archived: false })

    // 如果是父频道，同时取消归档所有子频道
    if (isParentChannel && channel.children && channel.children.length > 0) {
      // 创建子频道取消归档的Promise数组
      const childUnarchivePromises = channel.children.map((child) => ProjectsApi.update(child.id, { archived: false }))

      // 等待所有子频道取消归档完成
      await Promise.all(childUnarchivePromises)
    }

    // 刷新项目列表以获取最新状态
    await fetchProjects()

    // 显示成功消息
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

const ownerAndAdminExamples = computed(() => {
  if (!teamData.value) {
    return []
  }
  return [teamData.value.owner, ...(teamData.value.admins.examples || [])]
})

const ownerAndAdminTotal = computed(() => {
  if (!teamData.value) {
    return 0
  }
  return 1 + (teamData.value.admins.total || 0)
})

const ownerAndAdminsText = computed(() => {
  if (!ownerAndAdminTotal.value) {
    return '暂无管理员'
  } else if (ownerAndAdminTotal.value === 1) {
    return `创建者 ${ownerAndAdminExamples.value[0]!.nickname}`
  } else {
    return `创建者 ${ownerAndAdminExamples.value[0]!.nickname} 和 ${ownerAndAdminTotal.value - 1} 位管理员`
  }
})

const parentActiveProjects = computed(() => projects.value.filter((project) => !project.archived && !project.parentId))
const parentArchivedProjects = computed(() => projects.value.filter((project) => project.archived && !project.parentId))

const expandedChannels = ref<Record<number, boolean>>({})

const hasChildren = (project: Project) => {
  return project.children && project.children.filter((child) => !child.archived).length > 0
}

const toggleChannelExpand = (channelId: number) => {
  expandedChannels.value[channelId] = !expandedChannels.value[channelId]
}

// 为子频道按钮创建专用的处理函数
const handleCreateSubChannel = (parentId: number) => {
  // 简化处理，只调用创建对话框
  openCreateChannelDialog(parentId)
}

// 提供当前频道信息给子组件
provide('currentChannel', currentChannel)

// 判断当前是否为讨论详情页面
const isDiscussionDetailRoute = computed(() => {
  return route.name === 'TeamsDetailDiscussion' || (route.meta && route.meta.isDiscussionDetail === true)
})

// 获取所有归档频道，包括子频道（平铺显示）
const allArchivedProjects = computed(() => {
  const result: Project[] = []

  // 收集已归档的父频道
  const archivedParents = projects.value.filter((project) => project.archived && !project.parentId)
  result.push(...archivedParents)

  // 收集所有已归档的子频道（从所有父频道的children属性中查找）
  for (const project of projects.value) {
    if (project.children && project.children.length > 0) {
      const archivedChildren = project.children.filter((child) => child.archived)
      result.push(...archivedChildren)
    }
  }

  return result
})

// 在script部分修改状态变量
const showArchivedChannels = ref(true) // 默认展开

onMounted(async () => {
  const teamId = Number(route.params.teamId)
  await Promise.all([fetchTeamData(teamId), fetchProjects(), fetchTeamMembers()])
})
</script>

<style scoped lang="scss">
.layout-container {
  height: calc(100vh - var(--v-layout-top));
  overflow: hidden;
}

.sidebar-col {
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  height: calc(100vh - var(--v-layout-top));
  overflow-y: auto;
  position: fixed;
  top: var(--v-layout-top);
  left: 0;
  width: 16.666667%; /* 对应 lg="2" */
  z-index: 2;
}

.content-col {
  background-color: rgba(0, 0, 0, 0.02);
  height: calc(100vh - var(--v-layout-top));
  overflow-y: auto;
  margin-left: 16.666667%; /* 对应左侧边栏宽度 */
  width: 83.333333%; /* 对应 lg="10" */
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
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  height: calc(100vh - var(--v-layout-top) - 24px);
  margin: 12px;
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
