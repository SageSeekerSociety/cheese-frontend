<template>
  <div class="w-100 header-corner-glow-flow teams-explore-header-container">
    <div class="teams-explore-header h-100 d-flex flex-row align-stretch justify-space-between">
      <div class="px-8 py-16">
        <div class="text-h4 text-high-emphasis">与同频者，成就不凡。</div>
        <div class="text-subtitle-1 text-medium-emphasis mt-1">卓越的旅程，从找到并肩的队友开始。</div>
      </div>
    </div>
  </div>
  <v-container class="teams-container" fluid>
    <v-row>
      <v-col cols="12">
        <v-card flat class="main-card">
          <!-- 搜索框 -->
          <v-card-text class="pb-0">
            <v-form class="mb-4" @submit.prevent="fetchSearchResults(searchQuery)">
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
          </v-card-text>

          <!-- 动态内容区域 -->
          <v-card-text>
            <!-- 搜索结果 -->
            <v-fade-transition>
              <div v-if="searchTeamsData.length" class="search-results">
                <div class="d-flex align-center mb-3">
                  <v-icon icon="mdi-magnify" color="primary" class="mr-2"></v-icon>
                  <span class="text-h6">搜索结果</span>
                  <v-spacer></v-spacer>
                  <span class="text-body-2 text-medium-emphasis">找到 {{ searchTeamsData.length }} 个小队</span>
                </div>
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

            <!-- 搜索空状态 -->
            <div v-if="hasSearched && !searchTeamsData.length" class="empty-state-container py-6">
              <v-empty-state
                title="没有找到小队"
                text="请尝试其他搜索词"
                icon="mdi-account-search-outline"
                class="custom-empty-state"
              />
            </div>

            <!-- 默认内容 - 招募广场 -->
            <div v-if="!hasSearched && !searchTeamsData.length" class="default-content">
              <div class="feature-section recruitment-section">
                <div class="text-h6 mb-4 d-flex align-center flex-row gap-2">
                  招募广场
                  <v-chip color="warning" variant="tonal" size="small" prepend-icon="mdi-clock-outline">
                    即将推出
                  </v-chip>
                </div>
                <div class="feature-preview pa-6 rounded-lg text-center">
                  <v-avatar size="64" class="mb-3" color="primary" variant="tonal">
                    <v-icon icon="mdi-sign-caution"></v-icon>
                  </v-avatar>
                  <p class="text-subtitle-2 font-weight-medium text-center mb-1">Coming Soon</p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    即将支持小队管理员发布招募信息，让更多人发现并加入你的小队。
                  </p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- 申请加入对话框 -->
  <v-dialog v-model="joinRequestDialogOpen" max-width="500" transition="dialog-bottom-transition">
    <v-card rounded="lg" class="join-request-dialog elevation-0 border">
      <v-toolbar color="transparent" flat>
        <v-toolbar-title class="text-h6">申请加入小队</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="joinRequestDialogOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text class="py-5">
        <v-form @submit.prevent="submitJoinRequest">
          <p class="text-body-2 text-medium-emphasis mb-4">请输入申请理由，帮助管理员了解你加入小队的目的</p>
          <v-textarea
            v-model="joinRequestMessage"
            label="申请理由"
            variant="outlined"
            color="primary"
            placeholder="请简要介绍自己，说明为什么想加入这个小队..."
            rows="4"
            auto-grow
            class="mb-4"
            rounded="md"
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" class="mr-2" @click="joinRequestDialogOpen = false">取消</v-btn>
        <v-btn color="primary" variant="elevated" rounded="md" @click="submitJoinRequest"> 提交申请 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Team } from '@/types'

import { ref } from 'vue'
import { toast } from 'vuetify-sonner'

import { getAvatarUrl } from '@/utils/materials'

import { TeamsApi } from '@/network/api/teams'
import AccountService from '@/services/account'

const searchQuery = ref('')
const searchTeamsData = ref<Team[]>([])
const hasSearched = ref(false)

const joinRequestDialogOpen = ref(false)
const joinRequestMessage = ref('')
const targetTeamId = ref<number | null>(null)

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

  targetTeamId.value = teamId
  joinRequestDialogOpen.value = true
}

const submitJoinRequest = async () => {
  if (!targetTeamId.value) return

  try {
    await TeamsApi.createJoinRequest(targetTeamId.value, {
      message: joinRequestMessage.value || undefined,
    })
    toast.success('申请已提交，请等待管理员审核')
    joinRequestDialogOpen.value = false
    joinRequestMessage.value = ''
    targetTeamId.value = null
  } catch (error) {
    toast.error('申请提交失败，请稍后重试')
    console.error(error)
  }
}
</script>

<style scoped>
.main-card {
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

.join-request-dialog {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.teams-explore-header-container {
  position: relative;
  top: calc(-1 * var(--app-page-header-height));
  margin-bottom: calc(var(--app-page-header-height) * -1);
}

.teams-explore-header {
  padding-top: var(--app-page-header-height);
}

.default-content {
  min-height: 300px;
}
</style>
