<template>
  <v-card flat rounded="lg" class="member-task-card">
    <div class="member-task-card__top">
      <div class="member-task-card__main">
        <router-link :to="detailRoute" class="member-task-card__title">{{ participation.taskName }}</router-link>

        <div class="member-task-card__subline">
          <span>{{ participation.publisher.name }}</span>
          <span>{{ participation.category.name }}</span>
          <span>{{ identityText(participation.identityType) }}</span>
          <span v-if="participation.teamName">{{ participation.teamName }}</span>
        </div>

        <div class="member-task-card__chips">
          <v-chip size="small" :color="approvalColor(participation.approved)" variant="tonal">
            {{ approvalText(participation.approved) }}
          </v-chip>
          <v-chip size="small" :color="completionColor(participation.completionStatus)" variant="tonal">
            {{ completionText(participation.completionStatus) }}
          </v-chip>
          <v-chip v-if="participation.canSubmit" size="small" color="primary" variant="tonal">当前可提交</v-chip>
        </div>

        <div class="member-task-card__meta">
          <span>加入于 {{ formatDateTime(participation.joinedAt) }}</span>
          <span>{{ formatDeadline(participation.deadline) }}</span>
          <span>最近提交 {{ formatDateTime(participation.latestSubmissionAt) }}</span>
        </div>

        <div
          v-if="participation.latestReviewAccepted != null || participation.latestReviewScore != null"
          class="member-task-card__review"
        >
          <v-chip size="small" :color="participation.latestReviewAccepted ? 'success' : 'warning'" variant="tonal">
            {{ participation.latestReviewAccepted ? '最近一次评审已通过' : '最近一次评审未通过' }}
          </v-chip>
          <span v-if="participation.latestReviewScore != null" class="member-task-card__review-score">
            最近评分 {{ participation.latestReviewScore }}
          </span>
        </div>
      </div>

      <div class="member-task-card__actions">
        <v-btn v-if="primaryAction" :color="primaryAction.color" variant="flat" rounded="lg" :to="primaryAction.to">
          {{ primaryAction.label }}
        </v-btn>
        <v-btn variant="text" color="primary" :to="detailRoute">查看题目</v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { SpaceMyParticipation } from '@/network/api/spaces/types'

import { computed } from 'vue'

import {
  approvalColor,
  approvalText,
  completionColor,
  completionText,
  formatDateTime,
  formatDeadline,
  identityText,
} from '../helpers'

const props = defineProps<{
  participation: SpaceMyParticipation
  spaceId: number
}>()

const routeQuery = { from: 'my-participating' }

const detailRoute = computed(() => ({
  name: 'TasksDetail',
  params: { spaceId: props.spaceId, taskId: props.participation.taskId },
  query: routeQuery,
}))

const submitRoute = computed(() => ({
  name: 'TasksSubmit',
  params: { spaceId: props.spaceId, taskId: props.participation.taskId },
  query: routeQuery,
}))

const primaryAction = computed(() => {
  if (!props.participation.canSubmit) return null
  if (props.participation.completionStatus === 'REJECTED_RESUBMITTABLE') {
    return {
      label: '重新提交',
      color: 'warning',
      to: submitRoute.value,
    }
  }

  return {
    label: '去提交',
    color: 'primary',
    to: submitRoute.value,
  }
})
</script>

<style scoped lang="scss">
.member-task-card {
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.18);
    background-color: rgba(var(--v-theme-primary), 0.02);
    transform: translateY(-1px);
  }
}

.member-task-card__top {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: flex-start;
}

.member-task-card__main {
  min-width: 0;
  flex: 1;
}

.member-task-card__title {
  color: rgba(var(--v-theme-on-surface), 0.96);
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.45;
  text-decoration: none;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}

.member-task-card__subline,
.member-task-card__chips,
.member-task-card__meta,
.member-task-card__review {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.member-task-card__subline {
  margin-top: 10px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.88rem;
}

.member-task-card__chips {
  margin-top: 12px;
}

.member-task-card__meta {
  margin-top: 12px;
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-size: 0.85rem;
}

.member-task-card__review {
  align-items: center;
  margin-top: 14px;
}

.member-task-card__review-score {
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 0.85rem;
  font-weight: 500;
}

.member-task-card__actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .member-task-card__top {
    flex-direction: column;
  }
}
</style>
