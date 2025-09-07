<template>
  <v-container class="teams-container" fluid>
    <v-row>
      <v-col cols="12">
        <v-card flat class="my-teams-card" title="我的小队">
          <template #text>
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
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { Team } from '@/types'

import { onMounted, ref } from 'vue'

import { getAvatarUrl } from '@/utils/materials'

import { TeamsApi } from '@/network/api/teams'

const myTeams = ref<Team[]>([])
const isLoadingMyTeams = ref(false)
const loadMyTeamsError = ref(false)

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

onMounted(async () => {
  await fetchMyTeams()
})
</script>

<style scoped>
.my-teams-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.border {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.my-team-item {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.my-team-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.1);
}

.bg-error-lighten-5 {
  background-color: rgba(var(--v-theme-error), 0.1);
}
</style>
