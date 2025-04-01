<template>
  <!-- 加载和错误状态 -->
  <LoadingErrorContainer v-if="loading || error" :loading="loading" :error="error" @retry="loadTaskData" />

  <v-container v-else-if="taskData" class="pa-4">
    <!-- AI对话按钮 -->
    <AIChatButton :open="!chatDialogOpen" @click="openGeneralChat" />

    <!-- 任务头部区域 -->
    <TaskHeader
      :task-data="taskData"
      :breadcrumb-items="breadcrumbItems"
      :is-creator="isTaskCreator"
      :is-admin="isSpaceAdmin"
      :task-status-text="taskStatusText"
      :task-status-type="taskStatusType"
      :title-with-punctuation="titleStartsWithChinesePunctuation"
      :participation-info="participationInfo"
      @edit="openEditDialog"
      @delete="confirmDeleteTask"
      @join="events.emit('join-clicked')"
      @leave="events.emit('leave-clicked')"
    />

    <!-- 导航标签页 -->
    <TaskNavigationTabs
      v-model="activeTab"
      :task-data="taskData"
      :is-creator="isTaskCreator"
      :is-admin="isSpaceAdmin"
      :participation-info="participationInfo"
    />

    <!-- 路由视图 -->
    <router-view
      v-slot="{ Component }"
      :task-data="taskData"
      :is-creator="isTaskCreator"
      :is-admin="isSpaceAdmin"
      :participation-info="participationInfo"
    >
      <transition name="fade" mode="out-in">
        <component :is="Component" :task-data="taskData" :participation-info="participationInfo" />
      </transition>
    </router-view>
  </v-container>

  <!-- 对话框组件集合，通过事件总线通信 -->
  <TaskDialogs
    :task-data="taskData"
    :edit-task-data="editTaskData"
    :available-teams="availableTeams"
    :loading-teams="loadingTeams"
    :joined-teams="joinedTeams"
    :selected-leave-team-id="selectedLeaveTeamId"
    :selected-context="selectedContext"
    :participation-info="participationInfo"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { AIChatButton, LoadingErrorContainer, TaskDialogs, TaskHeader, TaskNavigationTabs } from './components'
import { useAIChat, useTaskData, useTaskManagement, useTaskParticipation, useTeamParticipation } from './composables'
import { useEvents } from './events'

const activeTab = ref(null)

// 使用任务模块的事件总线
const events = useEvents()

// 初始化各个模块
const taskDataModule = useTaskData()
const {
  taskData,
  loading,
  error,
  isTaskCreator,
  isSpaceAdmin,
  taskStatusText,
  taskStatusType,
  titleStartsWithChinesePunctuation,
  breadcrumbItems,
  editTaskData,
  loadTaskData,
  participationInfo,
} = taskDataModule

const taskManagementModule = useTaskManagement(taskDataModule)
const { openEditDialog, confirmDeleteTask } = taskManagementModule

const aiChatModule = useAIChat()
const { chatDialogOpen, selectedContext, openGeneralChat } = aiChatModule

const teamParticipationModule = useTeamParticipation(taskDataModule)
const { availableTeams, loadingTeams, joinedTeams, loadJoinedTeams, selectedLeaveTeamId } = teamParticipationModule

const taskParticipationModule = useTaskParticipation(taskDataModule)
const { onJoinTaskClicked, confirmLeaveTask } = taskParticipationModule

onMounted(() => {
  events.on('join-clicked', onJoinTaskClicked)
  events.on('leave-clicked', confirmLeaveTask)

  events.on('submit-verify', (data) => {
    taskParticipationModule.handleVerifyInfoSubmit(data).catch((error: Error) => {
      console.error('提交验证信息失败', error)
    })
  })

  events.on('submit-edit', (data) => {
    taskManagementModule.submitEditTask(data).catch((error: Error) => {
      console.error('编辑任务失败', error)
    })
  })

  events.on('select-team', (teamId) => {
    teamParticipationModule.selectTeam(teamId)
  })

  events.on('select-leave-team', (teamId) => {
    teamParticipationModule.selectLeaveTeam(teamId)
  })

  events.on('confirm-leave-team', () => {
    teamParticipationModule.confirmLeaveSelectedTeam().catch((error: Error) => {
      console.error('离开队伍失败', error)
    })
  })

  // 添加退出团队的事件处理
  events.on('leave-team', (teamId) => {
    taskParticipationModule.leaveTaskWithTeam(teamId)
  })

  // 加载任务数据
  loadTaskData().then(() => {
    // 如果是小队赛题，加载已参与的小队
    if (taskData.value?.submitterType === 'TEAM') {
      loadJoinedTeams()
    }
  })
})
</script>

<style scoped>
.task-header-card {
  background: linear-gradient(to right, rgb(var(--v-theme-surface)), rgb(var(--v-theme-background)));
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border-radius: 8px;
  color: rgb(var(--v-theme-on-surface));
}

.task-header-title {
  display: inline-block;
  font-size: 2rem !important;
}

.title-with-punctuation {
  text-indent: -0.5em;
}

.task-header-inner {
  position: relative;
  z-index: 2;
}

.task-header-inner::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 30%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.1), transparent 70%);
  opacity: 0.6;
  z-index: -1;
}

.task-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.15));
  border-radius: 8px;
  position: relative;
}

.task-icon-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  opacity: 0.8;
}

.task-status-chip {
  position: relative;
  overflow: hidden;
}

.task-header-card:hover {
  border-bottom-color: rgba(var(--v-theme-primary), 0.25);
}

.join-btn {
  background: linear-gradient(to right, rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary)));
  box-shadow: 0 2px 8px -2px rgba(var(--v-theme-primary), 0.6);
  border-radius: 6px;
  min-width: 120px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.join-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 6px 6px 0 0;
}

.join-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -3px rgba(var(--v-theme-primary), 0.7);
}

.task-tabs-card {
  background-color: var(--v-theme-surface);
  transition: all 0.3s ease;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.task-tabs-card::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(var(--v-theme-primary), 0.25),
    rgba(var(--v-theme-primary), 0.15),
    rgba(var(--v-theme-primary), 0.02)
  );
  z-index: 1;
}

.task-navigation-tabs {
  overflow: hidden;
}

.task-navigation-tabs :deep(.v-tab) {
  min-height: 46px;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
  opacity: 0.8;
  transition: all 0.25s ease;
  border-radius: 0;
  position: relative;
}

.task-navigation-tabs :deep(.v-tab:hover) {
  opacity: 0.95;
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.task-navigation-tabs :deep(.v-tab--selected) {
  background-color: transparent;
  color: rgb(var(--v-theme-primary));
  opacity: 1;
  font-weight: 600;
}

.task-navigation-tabs :deep(.v-tab--selected::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 2px;
  background-color: rgb(var(--v-theme-primary));
  border-radius: 2px 2px 0 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.verify-info-dialog :deep(.v-card) {
  overflow: hidden;
}

.info-alert-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  transition: all 0.2s ease;
}

.info-avatar {
  background: linear-gradient(135deg, rgb(var(--v-theme-info)), rgb(var(--v-theme-info)));
  box-shadow: 0 2px 4px rgba(var(--v-theme-info), 0.2);
}

.primary-soft {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.privacy-protection-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background-color: rgb(var(--v-theme-surface));
}

.privacy-usage-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.privacy-usage-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.15);
  background-color: rgba(var(--v-theme-primary), 0.01);
}

.privacy-rights-alert {
  background-color: rgba(var(--v-theme-info), 0.05);
  border-color: rgba(var(--v-theme-info), 0.3);
}

/* AI 对话按钮样式 */
.ai-chat-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.ai-chat-fab:hover {
  transform: scale(1.05);
}

.privacy-link {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px dashed rgba(var(--v-theme-primary), 0.5);
}

.privacy-link:hover {
  border-bottom-color: rgb(var(--v-theme-primary));
  opacity: 0.9;
}

.privacy-checkbox :deep(.v-label) {
  opacity: 1;
}

/* 团队选择样式 */
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

.disabled-notice {
  position: relative;
  z-index: 2;
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

.team-card-disabled .member-chip {
  opacity: 0.7;
}
</style>
