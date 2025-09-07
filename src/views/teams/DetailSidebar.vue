<template>
  <SecondaryNavigation>
    <!-- 小队信息头部 -->
    <div class="team-header pa-4">
      <div class="d-flex align-center">
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
    <div class="px-2 pt-2 pb-2">
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
              v-for="child in (project.children ?? []).filter((child) => !child.archived)"
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
                <div class="channel-dot child-channel-dot mr-2" :style="{ backgroundColor: child.colorCode }"></div>
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
        <div class="archive-header d-flex align-center px-2 py-1" @click="showArchivedChannels = !showArchivedChannels">
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
  </SecondaryNavigation>
</template>

<script setup lang="ts">
import type { Project, Team, User } from '@/types'

import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { getAvatarUrl } from '@/utils/materials'

import SecondaryNavigation from '@/components/common/Navigation/SecondaryNavigation.vue'
import AccountService from '@/services/account'

interface Props {
  teamData?: Team
  teamMembers: User[]
  teamMembersCount: number
  projects: Project[]
  loading: boolean
  expandedChannels: Record<number, boolean>
  showArchivedChannels: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  openCreateChannelDialog: []
  handleCreateSubChannel: [parentId: number]
  toggleChannelExpand: [channelId: number]
  'update:showArchivedChannels': [value: boolean]
}>()

const route = useRoute()

const activeChannelId = computed(() => {
  const channelId = route.params.channelId
  if (channelId) {
    return Number(channelId)
  }
  return null
})

const activeProjects = computed(() => props.projects.filter((project) => !project.archived))

const isTeamAdmin = computed(() => {
  if (!props.teamData || !AccountService.user) {
    return false
  }

  if (props.teamData.owner.id === AccountService.user.id) {
    return true
  }

  const isAdmin = props.teamData.admins.examples?.some((admin) => admin.id === AccountService.user?.id)

  return !!isAdmin
})

const parentActiveProjects = computed(() => props.projects.filter((project) => !project.archived && !project.parentId))

const ownerAndAdminExamples = computed(() => {
  if (!props.teamData) {
    return []
  }
  return [props.teamData.owner, ...(props.teamData.admins.examples || [])]
})

const ownerAndAdminTotal = computed(() => {
  if (!props.teamData) {
    return 0
  }
  return 1 + (props.teamData.admins.total || 0)
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

const allArchivedProjects = computed(() => {
  const result: Project[] = []

  const archivedParents = props.projects.filter((project) => project.archived && !project.parentId)
  result.push(...archivedParents)

  for (const project of props.projects) {
    if (project.children && project.children.length > 0) {
      const archivedChildren = project.children.filter((child) => child.archived)
      result.push(...archivedChildren)
    }
  }

  return result
})

const showArchivedChannels = computed({
  get: () => props.showArchivedChannels,
  set: (value: boolean) => emit('update:showArchivedChannels', value),
})

const getUnreadCount = (channelId: number) => {
  // 这里应该通过API获取真实的未读消息数
  // 现在先模拟一些数据
  const counts: Record<number, number> = {}
  return counts[channelId] || 0
}

const hasChildren = (project: Project) => {
  return project.children && project.children.filter((child) => !child.archived).length > 0
}

const openCreateChannelDialog = () => {
  emit('openCreateChannelDialog')
}

const handleCreateSubChannel = (parentId: number) => {
  emit('handleCreateSubChannel', parentId)
}

const toggleChannelExpand = (channelId: number) => {
  emit('toggleChannelExpand', channelId)
}
</script>

<style scoped lang="scss">
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
