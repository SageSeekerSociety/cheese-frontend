<template>
  <v-card flat rounded="lg" class="member-task-card">
    <div class="member-task-card__top">
      <div class="member-task-card__main">
        <router-link :to="detailRoute" class="member-task-card__title">{{ task.taskName }}</router-link>

        <div class="member-task-card__chips">
          <v-chip size="small" variant="tonal">{{ task.category.name }}</v-chip>
          <v-chip size="small" :color="approvalColor(task.approved)" variant="tonal">
            {{ approvalText(task.approved) }}
          </v-chip>
          <v-chip v-if="task.pendingParticipantApprovalCount > 0" size="small" color="warning" variant="tonal">
            {{ formatCount(task.pendingParticipantApprovalCount) }} 个待审核报名
          </v-chip>
          <v-chip v-if="task.pendingReviewCount > 0" size="small" color="info" variant="tonal">
            {{ formatCount(task.pendingReviewCount) }} 个待评审提交
          </v-chip>
        </div>

        <div class="member-task-card__meta">
          <span>发布于 {{ formatDateTime(task.createdAt) }}</span>
          <span>{{ formatDeadline(task.deadline) }}</span>
          <span>最近提交 {{ formatDateTime(task.latestSubmissionAt) }}</span>
        </div>
      </div>

      <div class="member-task-card__rate">
        <div class="member-task-card__rate-value">{{ formatPercent(task.successRate) }}</div>
        <div class="member-task-card__rate-label">成功率</div>
      </div>
    </div>

    <div class="member-task-card__stats">
      <div class="stat-pill">报名主体 {{ formatCount(task.participantCount) }}</div>
      <div class="stat-pill">审核通过 {{ formatCount(task.approvedParticipantCount) }}</div>
      <div class="stat-pill">已提交 {{ formatCount(task.submittedParticipantCount) }}</div>
      <div class="stat-pill">成功主体 {{ formatCount(task.successfulParticipantCount) }}</div>
      <div class="stat-pill">失败主体 {{ formatCount(task.failedParticipantCount) }}</div>
      <div class="stat-pill">提交转化 {{ formatPercent(task.submissionConversionRate) }}</div>
    </div>

    <div class="member-task-card__actions">
      <v-btn variant="text" color="primary" :to="detailRoute">查看详情</v-btn>
      <v-btn v-if="task.pendingParticipantApprovalCount > 0" variant="tonal" color="warning" :to="participantsRoute">
        处理报名
      </v-btn>
      <v-btn v-if="task.pendingReviewCount > 0" variant="tonal" color="info" :to="submissionsRoute">评审提交</v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { SpaceMyPublishedTask } from '@/network/api/spaces/types'

import { computed } from 'vue'

import { approvalColor, approvalText, formatCount, formatDateTime, formatDeadline, formatPercent } from '../helpers'

const props = defineProps<{
  task: SpaceMyPublishedTask
  spaceId: number
}>()

const routeQuery = { from: 'my-publishing' }

const detailRoute = computed(() => ({
  name: 'TasksDetail',
  params: { spaceId: props.spaceId, taskId: props.task.taskId },
  query: routeQuery,
}))

const participantsRoute = computed(() => ({
  name: 'TasksParticipants',
  params: { spaceId: props.spaceId, taskId: props.task.taskId },
  query: routeQuery,
}))

const submissionsRoute = computed(() => ({
  name: 'TasksSubmissions',
  params: { spaceId: props.spaceId, taskId: props.task.taskId },
  query: routeQuery,
}))
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

.member-task-card__chips,
.member-task-card__meta,
.member-task-card__stats,
.member-task-card__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.member-task-card__chips {
  margin-top: 12px;
}

.member-task-card__meta {
  margin-top: 12px;
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-size: 0.85rem;
}

.member-task-card__rate {
  min-width: 108px;
  text-align: right;
}

.member-task-card__rate-value {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: rgba(var(--v-theme-on-surface), 0.94);
}

.member-task-card__rate-label {
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.55);
  font-size: 0.82rem;
}

.member-task-card__stats {
  margin-top: 18px;
}

.stat-pill {
  padding: 8px 12px;
  border-radius: 999px;
  background-color: rgba(var(--v-theme-primary), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.74);
  font-size: 0.84rem;
  font-weight: 500;
}

.member-task-card__actions {
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 960px) {
  .member-task-card__top {
    flex-direction: column;
  }

  .member-task-card__rate {
    text-align: left;
  }

  .member-task-card__actions {
    justify-content: flex-start;
  }
}
</style>
