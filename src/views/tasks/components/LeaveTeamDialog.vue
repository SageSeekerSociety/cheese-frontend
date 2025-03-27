<template>
  <v-dialog :model-value="open" max-width="560" scrollable @update:model-value="$emit('close')">
    <v-card rounded="lg" elevation="3">
      <v-card-title class="pa-4 pb-3">
        <div class="d-flex align-center">
          <v-icon color="error" class="mr-3" size="28">mdi-exit-run</v-icon>
          <span class="text-h5 font-weight-medium">退出赛题</span>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <div class="px-4 pt-4 pb-3">
          <div class="text-body-1">请选择要退出的小队：</div>
          <div class="text-caption text-medium-emphasis mt-1">
            退出后，该小队将不再参与此赛题。如需重新参与，可重新领取赛题。
          </div>
        </div>

        <div v-if="loading" class="d-flex justify-center my-8">
          <v-progress-circular indeterminate color="primary" size="56"></v-progress-circular>
        </div>

        <div v-else-if="joinedTeams.length === 0" class="text-center py-8 px-4">
          <v-avatar color="info" class="mb-4" size="64">
            <v-icon icon="mdi-information-outline" color="white" size="36"></v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-medium mb-2">没有已参与的小队</div>
          <div class="text-body-1 text-medium-emphasis max-width-400 mx-auto">您目前没有代表任何小队参与此赛题</div>
        </div>

        <div v-else class="px-4 pt-2 pb-4">
          <div class="leave-team-cards-container mt-2">
            <v-card
              v-for="team in joinedTeams"
              :key="team.id"
              class="team-card mb-3"
              flat
              rounded="lg"
              :color="selectedTeamId === team.id ? 'error-lighten-5' : undefined"
              :border="selectedTeamId === team.id ? true : false"
              variant="outlined"
              @click="$emit('select', team.id)"
            >
              <div class="d-flex pa-3">
                <v-avatar size="52" class="mr-3 flex-shrink-0">
                  <v-img v-if="team.avatarId" :src="getAvatarUrl(team.avatarId)" :alt="team.name"></v-img>
                  <v-icon v-else size="28" color="primary">mdi-account-group</v-icon>
                </v-avatar>

                <div class="flex-grow-1 min-width-0">
                  <div class="d-flex align-center flex-wrap gap-2 mb-1">
                    <span class="text-subtitle-1 font-weight-medium text-truncate">{{ team.name }}</span>
                    <v-chip size="small" color="info" label class="px-2"> 已参与 </v-chip>
                  </div>

                  <div class="text-body-2 text-medium-emphasis text-truncate mb-2">{{ team.intro }}</div>
                </div>

                <div class="select-btn-container ml-3 d-flex align-center">
                  <v-radio-group v-model="selectedTeamIdProxy" hide-details>
                    <v-radio :value="team.id"></v-radio>
                  </v-radio-group>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="$emit('close')">取消</v-btn>
        <v-btn color="error" variant="flat" :disabled="!selectedTeamId" @click="$emit('confirm')"> 退出赛题 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { TeamSummary } from '@/network/api/tasks/types'
import type { Task } from '@/types'

import { computed } from 'vue'

import { getAvatarUrl } from '@/utils/materials'

const props = defineProps<{
  open: boolean
  taskData: Task | null
  loading: boolean
  joinedTeams: TeamSummary[]
  selectedTeamId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', teamId: number): void
  (e: 'confirm'): void
}>()

// 使用计算属性代理selectedTeamId，防止直接修改prop
const selectedTeamIdProxy = computed({
  get: () => props.selectedTeamId,
  set: (value) => {
    if (value !== null) {
      emit('select', value)
    }
  },
})
</script>

<style scoped>
.leave-team-cards-container {
  max-height: 460px;
  overflow-y: auto;
  padding-right: 4px;
}

.team-card {
  position: relative;
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), 0.15);
  background-color: rgb(var(--v-theme-surface));
  cursor: pointer;
  overflow: hidden;
}

.team-card:hover {
  border-color: rgba(var(--v-theme-error), 0.3);
  background-color: rgba(var(--v-theme-error), 0.02);
  transform: translateY(-1px);
}

.min-width-0 {
  min-width: 0;
}

.max-width-400 {
  max-width: 400px;
}

.select-btn-container {
  align-self: center;
}
</style>
