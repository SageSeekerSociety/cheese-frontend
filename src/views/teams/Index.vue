<template>
  <v-container class="teams-container">
    <v-row>
      <!-- 左侧主内容区 -->
      <v-col cols="12" md="8">
        <v-card rounded="lg" class="search-card elevation-0 border">
          <v-card-title class="d-flex align-center pb-0 pt-4 px-4">
            <v-icon icon="mdi-account-group" class="mr-2" color="primary" />
            <span class="text-h6">发现小队</span>
          </v-card-title>
          <v-card-text class="px-4 py-4">
            <v-form class="mb-5" @submit.prevent="fetchSearchResults(searchQuery)">
              <v-text-field
                v-model="searchQuery"
                density="comfortable"
                placeholder="搜索小队 ID 或名称..."
                prepend-inner-icon="mdi-magnify"
                rounded="lg"
                variant="outlined"
                color="primary"
                hide-details
                class="search-field"
                bg-color="background"
                @keyup.enter="fetchSearchResults(searchQuery)"
              >
                <template #append>
                  <v-btn
                    v-if="searchQuery"
                    variant="text"
                    icon="mdi-close"
                    size="small"
                    @click="
                      () => {
                        searchQuery = ''
                        searchTeamsData = []
                        hasSearched = false
                      }
                    "
                  ></v-btn>
                </template>
              </v-text-field>
            </v-form>

            <div v-if="!searchTeamsData.length" class="empty-state-container py-6">
              <v-empty-state
                v-if="!hasSearched"
                title="寻找你的小队"
                text="输入小队 ID 或名称开始搜索"
                icon="mdi-account-search"
                class="custom-empty-state"
              />
              <v-empty-state
                v-else
                title="没有找到小队"
                text="请尝试其他搜索词"
                icon="mdi-account-search-outline"
                class="custom-empty-state"
              />
            </div>

            <v-fade-transition>
              <div v-if="searchTeamsData.length" class="search-results">
                <p class="text-body-2 text-medium-emphasis mb-3">找到 {{ searchTeamsData.length }} 个小队</p>
                <v-list class="team-list pa-0" rounded="md">
                  <v-list-item
                    v-for="team in searchTeamsData"
                    :key="team.id"
                    :title="team.name"
                    :subtitle="team.intro"
                    :prepend-avatar="getAvatarUrl(team.avatarId)"
                    :to="{ name: 'TeamsDetail', params: { teamId: team.id } }"
                    rounded="md"
                    class="team-list-item mb-3"
                  >
                    <template #append>
                      <v-btn
                        variant="tonal"
                        color="primary"
                        rounded="md"
                        density="comfortable"
                        class="join-btn"
                        @click.stop.prevent="joinTeam(team.id)"
                      >
                        <v-icon icon="mdi-account-plus" size="small" class="mr-1"></v-icon>
                        申请加入
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-fade-transition>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右侧侧边栏 -->
      <v-col cols="12" md="4">
        <div class="d-flex flex-column teams-right-container">
          <v-card
            rounded="lg"
            class="create-team-card elevation-0 border mb-4"
            color="primary"
            :class="{ 'primary-gradient': true }"
          >
            <v-card-text class="d-flex flex-column align-center py-6">
              <v-avatar size="60" class="mb-3 bg-white elevation-0">
                <v-icon icon="mdi-account-group-outline" size="large" color="primary"></v-icon>
              </v-avatar>
              <h3 class="text-h6 font-weight-medium text-center text-white mb-1">创建你的小队</h3>
              <p class="text-body-2 text-center text-white mb-3">组建一个属于你的团队，一起共同成长</p>
              <v-btn
                prepend-icon="mdi-plus"
                variant="elevated"
                color="white"
                class="create-btn"
                rounded="md"
                @click="openCreateTeamDialog"
              >
                <span class="text-primary">创建小队</span>
              </v-btn>
            </v-card-text>
          </v-card>

          <v-card rounded="lg" class="my-teams-card elevation-0 border">
            <v-card-title class="d-flex align-center pb-2 pt-4 px-4">
              <v-icon icon="mdi-shield-account" class="mr-2" color="primary" />
              <span class="text-h6">我的小队</span>
              <!-- <v-spacer></v-spacer>
              <v-btn
                v-if="!isLoadingMyTeams"
                icon="mdi-refresh"
                size="small"
                variant="text"
                :disabled="isLoadingMyTeams"
                @click="fetchMyTeams"
              ></v-btn> -->
            </v-card-title>
            <v-card-text class="px-3 py-3">
              <!-- 加载状态 -->
              <div v-if="isLoadingMyTeams" class="d-flex flex-column align-center py-5">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  :size="40"
                  :width="3"
                  class="mb-3"
                ></v-progress-circular>
                <p class="text-body-2 text-medium-emphasis text-center">加载中...</p>
              </div>

              <!-- 错误状态 -->
              <div v-else-if="loadMyTeamsError" class="d-flex flex-column align-center py-5">
                <v-avatar size="50" class="mb-3 bg-error-lighten-5">
                  <v-icon icon="mdi-alert-circle" size="large" color="error"></v-icon>
                </v-avatar>
                <p class="text-subtitle-1 font-weight-medium text-center mb-1">加载失败</p>
                <p class="text-body-2 text-center text-medium-emphasis mb-3">无法获取小队信息</p>
                <v-btn variant="tonal" color="primary" size="small" prepend-icon="mdi-refresh" @click="fetchMyTeams">
                  重新加载
                </v-btn>
              </div>

              <!-- 空状态 -->
              <div v-else-if="!myTeams.length" class="d-flex flex-column align-center py-5">
                <v-avatar size="50" class="mb-3 bg-grey-lighten-4">
                  <v-icon icon="mdi-account-group" size="large" color="grey-darken-1"></v-icon>
                </v-avatar>
                <p class="text-subtitle-1 font-weight-medium text-center mb-1">还没有加入小队</p>
                <p class="text-body-2 text-center text-medium-emphasis">创建一个新的小队，或者加入一个现有的小队</p>
              </div>

              <!-- 小队列表 -->
              <v-list v-else class="my-teams-list pa-0">
                <v-list-item
                  v-for="team in myTeams"
                  :key="team.id"
                  :title="team.name"
                  :subtitle="team.intro"
                  :prepend-avatar="getAvatarUrl(team.avatarId)"
                  :to="{ name: 'TeamsDetail', params: { teamId: team.id } }"
                  rounded="md"
                  class="my-team-item mb-2"
                >
                  <template #append>
                    <v-icon icon="mdi-chevron-right" color="grey-darken-1"></v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <!-- 创建小队对话框 -->
  <v-dialog v-model="createTeamDialog" width="600" transition="dialog-bottom-transition">
    <v-card rounded="lg" class="create-team-dialog elevation-0 border">
      <v-toolbar color="transparent" flat>
        <v-toolbar-title class="text-h6">创建小队</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="createTeamDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text class="py-5">
        <v-form>
          <v-container fluid>
            <v-row>
              <v-col cols="12" md="4" class="text-center">
                <avatar-uploader v-model="teamAvatar" />
                <p class="text-body-2 text-medium-emphasis mb-2">小队头像</p>
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="teamName"
                  label="小队名称"
                  variant="outlined"
                  color="primary"
                  placeholder="输入小队名称..."
                  :rules="[(v) => !!v || '请输入小队名称']"
                  class="mb-4"
                  rounded="md"
                ></v-text-field>

                <p class="text-body-2 text-medium-emphasis mb-2">小队描述</p>
                <tip-tap-editor
                  ref="teamDescriptionEditor"
                  v-model="teamDescription"
                  output="html"
                  placeholder="描述你的小队定位、目标和文化..."
                  class="team-description-editor rounded-md"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" class="mr-2" @click="createTeamDialog = false">取消</v-btn>
        <v-btn color="primary" variant="elevated" rounded="md" :loading="creatingTeam" @click="createTeam">
          创建小队
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap'
import type { Team } from '@/types'

import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'

import { getAvatarUrl } from '@/utils/materials'

import AvatarUploader from '@/components/common/AvatarUploader.vue'
import { AvatarsApi } from '@/network/api/avatars'
import { TeamsApi } from '@/network/api/teams'
import AccountService from '@/services/account'

const TipTapEditor = defineAsyncComponent(() => import('@/components/common/Editor/TipTapEditor.vue'))

const createTeamDialog = ref(false)
const searchQuery = ref('')
const searchTeamsData = ref<Team[]>([])
const hasSearched = ref(false)
const myTeams = ref<Team[]>([])
const teamName = ref('')
const teamDescription = ref<JSONContent>({ type: 'doc', content: [] })
const teamDescriptionEditor = ref<InstanceType<typeof TipTapEditor>>()
const teamAvatar = ref<File | undefined>()
const creatingTeam = ref(false)
const isLoadingMyTeams = ref(false)
const loadMyTeamsError = ref(false)

const router = useRouter()

const openCreateTeamDialog = () => {
  createTeamDialog.value = true
}
const createTeam = async () => {
  if (!teamName.value) {
    toast.error('请输入小队名称')
    return
  }

  try {
    creatingTeam.value = true
    let intro = teamDescriptionEditor.value?.editor?.getText() ?? ''
    if (intro.length > 250) {
      intro = `${intro.slice(0, 250)}…`
    }

    const {
      data: { avatarId },
    } = teamAvatar.value ? await AvatarsApi.createAvatar(teamAvatar.value) : { data: { avatarId: null } }

    const {
      data: { team },
    } = await TeamsApi.create({
      name: teamName.value,
      description: JSON.stringify(teamDescription.value),
      intro,
      avatarId: avatarId ?? 1,
    })

    toast.success('创建小队成功')
    router.push(`/teams/${team.id}`)
  } catch (error) {
    toast.error('创建小队失败，请稍后重试')
    console.error(error)
  } finally {
    creatingTeam.value = false
  }
}

const fetchMyTeams = async () => {
  isLoadingMyTeams.value = true
  loadMyTeamsError.value = false

  try {
    const {
      data: { teams },
    } = await TeamsApi.getMyTeams()
    myTeams.value = teams
  } catch (error) {
    console.error('获取我的小队失败:', error)
    loadMyTeamsError.value = true
  } finally {
    isLoadingMyTeams.value = false
  }
}

const fetchSearchResults = async (query: string) => {
  if (!query) {
    searchTeamsData.value = []
    hasSearched.value = false
    return
  }

  hasSearched.value = true
  try {
    const {
      data: { teams },
    } = await TeamsApi.search({ query })
    searchTeamsData.value = teams
  } catch (error) {
    toast.error('搜索失败，请稍后重试')
    console.error(error)
  }
}

const joinTeam = async (teamId: number) => {
  if (!AccountService.user) {
    toast.error('请先登录')
    return
  }

  try {
    await TeamsApi.addMember(teamId, { user_id: AccountService.user.id, role: 'MEMBER' })
    toast.success('申请加入小队成功')
    await fetchMyTeams() // 刷新我的小队列表
  } catch (error) {
    toast.error('申请加入失败，请稍后重试')
    console.error(error)
  }
}

onMounted(async () => {
  await fetchMyTeams()
})
</script>

<style scoped>
.teams-right-container {
  gap: 16px;
  height: 100%;
}

.search-card,
.my-teams-card,
.create-team-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.border {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.search-field {
  transition: all 0.3s ease;
}

.search-field:deep(.v-field__outline) {
  opacity: 0.7;
}

.search-field:hover:deep(.v-field__outline) {
  opacity: 1;
}

.team-list-item {
  transition: all 0.2s ease;
  margin-bottom: 8px;
  border: 1px solid transparent;
}

.team-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.1);
}

.join-btn {
  transition: transform 0.2s ease;
}

.join-btn:hover {
  transform: scale(1.05);
}

.primary-gradient {
  background: linear-gradient(135deg, var(--v-theme-primary), var(--v-theme-primary-darken-1));
}

.create-btn {
  transition: transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.my-team-item {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.my-team-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.1);
}

.team-description-editor {
  min-height: 150px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
}

.empty-state-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-empty-state:deep(.v-empty-state__icon) {
  color: var(--v-theme-primary);
  opacity: 0.9;
}

.create-team-dialog:deep(.v-card-text) {
  scrollbar-width: thin;
}

.bg-error-lighten-5 {
  background-color: rgba(var(--v-theme-error), 0.1);
}
</style>
