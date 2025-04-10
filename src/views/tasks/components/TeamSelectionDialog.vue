<template>
  <v-dialog :model-value="open" max-width="620" scrollable @update:model-value="$emit('close')">
    <v-card rounded="lg" elevation="3">
      <v-card-title class="pa-4 pb-3">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-3" size="28">mdi-account-group</v-icon>
          <span class="text-h5 font-weight-medium">选择参与小队</span>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <div class="px-4 pt-4 pb-2">
          <div class="text-body-1">请选择一个小队代表参与此赛题</div>
        </div>

        <div v-if="loading" class="d-flex justify-center my-8">
          <v-progress-circular indeterminate color="primary" size="56"></v-progress-circular>
        </div>

        <div v-else-if="eligibleTeams.length === 0" class="text-center py-8 px-4">
          <v-avatar color="warning" class="mb-4" size="64">
            <v-icon icon="mdi-alert-circle-outline" color="white" size="36"></v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-medium mb-2">暂无可用小队</div>
          <div class="text-body-1 text-medium-emphasis max-width-400 mx-auto">
            {{
              taskData?.requireRealName
                ? '请确保您的小队所有成员都已完成实名认证，或创建一个新的小队'
                : '您可能需要创建一个小队或加入一个小队才能参与此赛题'
            }}
          </div>
        </div>

        <div v-else class="px-4 pt-2 pb-4">
          <!-- 实名认证提示 -->
          <v-card
            v-if="taskData?.requireRealName"
            class="mb-4 info-alert-card"
            variant="flat"
            rounded="lg"
            color="grey-lighten-4"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-start">
                <v-avatar size="36" color="primary" class="mr-3 info-avatar">
                  <v-icon icon="mdi-shield-account" color="white" size="20"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-medium mb-1">实名认证要求</div>
                  <p class="text-body-2 mb-0">此赛题要求实名参与，只有所有成员都已完成实名认证的小队才能参与</p>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <div class="team-cards-container mt-2">
            <v-card
              v-for="teamEligibility in availableTeams"
              :key="teamEligibility.team.id"
              :disabled="!teamEligibility.eligibility.eligible"
              class="team-card mb-3"
              :class="{ 'team-card-disabled': !teamEligibility.eligibility.eligible }"
              flat
              rounded="lg"
              variant="outlined"
              @click="teamEligibility.eligibility.eligible ? $emit('select', teamEligibility.team.id) : null"
            >
              <div v-if="!teamEligibility.eligibility.eligible" class="team-card-overlay">
                <div class="certification-required">
                  <v-icon
                    :icon="getTeamDisabledIcon(teamEligibility)"
                    :color="getTeamDisabledColor(teamEligibility)"
                    size="22"
                    class="mr-2"
                  ></v-icon>
                  <span>{{ getTeamDisabledText(teamEligibility) }}</span>
                </div>
              </div>
              <div class="d-flex pa-3">
                <v-avatar size="52" class="mr-3 flex-shrink-0">
                  <v-img
                    v-if="teamEligibility.team.avatarId"
                    :src="getAvatarUrl(teamEligibility.team.avatarId)"
                    :alt="teamEligibility.team.name"
                  ></v-img>
                  <v-icon v-else size="28" color="primary">mdi-account-group</v-icon>
                </v-avatar>

                <div class="flex-grow-1 min-width-0">
                  <div class="d-flex align-center flex-wrap gap-2 mb-1">
                    <span class="text-subtitle-1 font-weight-medium text-truncate">{{
                      teamEligibility.team.name
                    }}</span>
                    <v-chip
                      size="small"
                      :color="getTeamVerificationStatus(teamEligibility.team).color"
                      :text-color="
                        getTeamVerificationStatus(teamEligibility.team).color === 'success' ? 'white' : undefined
                      "
                      label
                      class="px-2"
                    >
                      {{ getTeamVerificationStatus(teamEligibility.team).status }}
                    </v-chip>
                  </div>

                  <div class="text-body-2 text-medium-emphasis text-truncate mb-2">
                    {{ teamEligibility.team.intro }}
                  </div>

                  <div
                    v-if="
                      taskData?.requireRealName &&
                      teamEligibility.team.memberRealNameStatus &&
                      teamEligibility.team.memberRealNameStatus.length > 0
                    "
                    class="team-members-container"
                  >
                    <div class="text-caption text-medium-emphasis mb-1">成员认证状态</div>
                    <div class="d-flex flex-wrap gap-1">
                      <v-chip
                        v-for="member in teamEligibility.team.memberRealNameStatus"
                        :key="member.memberId"
                        size="x-small"
                        :color="member.hasRealNameInfo ? 'success' : 'error'"
                        :variant="member.hasRealNameInfo ? 'flat' : 'outlined'"
                        class="member-chip"
                      >
                        <template #prepend>
                          <v-icon size="12" class="mr-1">
                            {{ member.hasRealNameInfo ? 'mdi-check-circle' : 'mdi-close-circle' }}
                          </v-icon>
                        </template>
                        {{ member.userName }}
                      </v-chip>
                    </div>
                  </div>
                </div>

                <div v-if="teamEligibility.eligibility.eligible" class="select-btn-container ml-3 d-flex align-center">
                  <v-btn icon="mdi-chevron-right" variant="text" color="primary" size="small"></v-btn>
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
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Task, TeamSummary, TeamTaskEligibility } from '@/types'

import { computed } from 'vue'

import { getAvatarUrl } from '@/utils/materials'

const props = defineProps<{
  open: boolean
  taskData: Task | null
  availableTeams: TeamTaskEligibility[]
  loading: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'select', teamId: number): void
}>()

// 获取符合条件的小队列表
const eligibleTeams = computed(() => {
  return props.availableTeams.filter((team) => team.eligibility.eligible)
})

const getTeamVerificationStatus = (team: TeamSummary): { status: string; color: string } => {
  if (!props.taskData?.requireRealName) {
    return { status: '可参与', color: 'success' }
  }

  if (team.allMembersVerified) {
    return { status: '全部已认证', color: 'success' }
  } else {
    return { status: '未全部认证', color: 'error' }
  }
}

const getTeamDisabledIcon = (teamEligibility: TeamTaskEligibility): string => {
  if (!teamEligibility.eligibility.reasons || teamEligibility.eligibility.reasons.length === 0) {
    return 'mdi-alert-circle'
  }

  const reason = teamEligibility.eligibility.reasons[0]

  switch (reason.code) {
    case 'TEAM_MEMBER_MISSING_REAL_NAME':
      return 'mdi-account-alert'
    case 'TEAM_MEMBER_RANK_NOT_HIGH_ENOUGH':
      return 'mdi-star-off'
    case 'TEAM_SIZE_MIN_NOT_MET':
      return 'mdi-account-group-remove'
    case 'TEAM_SIZE_MAX_EXCEEDED':
      return 'mdi-account-group-alert'
    default:
      return 'mdi-alert-circle'
  }
}

const getTeamDisabledColor = (teamEligibility: TeamTaskEligibility): string => {
  if (!teamEligibility.eligibility.reasons || teamEligibility.eligibility.reasons.length === 0) {
    return 'warning'
  }

  const reason = teamEligibility.eligibility.reasons[0]

  if (reason.code === 'TEAM_MEMBER_MISSING_REAL_NAME') {
    return 'error'
  }

  return 'warning'
}

const getTeamDisabledText = (teamEligibility: TeamTaskEligibility): string => {
  if (!teamEligibility.eligibility.reasons || teamEligibility.eligibility.reasons.length === 0) {
    return '不满足参与条件'
  }

  // 直接使用后端提供的消息
  return teamEligibility.eligibility.reasons[0].message
}
</script>

<style scoped>
.team-cards-container {
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

.team-card:not(.team-card-disabled):hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background-color: rgba(var(--v-theme-primary), 0.04);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.05);
}

.team-card-disabled {
  opacity: 0.9;
  background-color: rgb(var(--v-theme-surface));
  cursor: not-allowed;
  border-color: rgba(var(--v-border-color), 0.2);
}

.team-card-disabled::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-surface-variant), 0.3),
    rgba(var(--v-theme-surface-variant), 0.15)
  );
  opacity: 0.8;
  pointer-events: none;
}

.team-card-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(1px);
}

.certification-required {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: rgba(var(--v-theme-error), 0.08);
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-error), 0.2);
  color: rgb(var(--v-theme-error));
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(var(--v-theme-error), 0.1);
}

.member-chip {
  transition: all 0.15s ease;
}

.member-chip:hover {
  transform: translateY(-1px);
}

.team-members-container {
  padding-top: 4px;
  border-top: 1px dashed rgba(var(--v-border-color), 0.3);
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

.info-avatar {
  background: linear-gradient(135deg, rgb(var(--v-theme-info)), rgb(var(--v-theme-info)));
  box-shadow: 0 2px 4px rgba(var(--v-theme-info), 0.2);
}

.info-alert-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  transition: all 0.2s ease;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
