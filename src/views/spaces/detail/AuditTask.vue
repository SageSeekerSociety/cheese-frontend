<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="t('spaces.detail.auditTasks.title')" color="transparent" density="compact"></v-toolbar>
    <div class="tasks-list">
      <infinite-scroll
        :loading="loadingMore"
        :has-more="hasMore"
        :initial-loading="refreshing"
        :is-empty="tasks.length === 0"
        @load-more="loadMore"
      >
        <template #empty>
          <v-empty-state icon="mdi-trophy" :title="t('spaces.detail.auditTasks.noTasks')"></v-empty-state>
        </template>
        <v-card
          v-for="task in tasks"
          :key="task.id"
          flat
          border
          :ripple="false"
          rounded="lg"
          class="task-card tasks-list-item"
          @click="toggleExpand(task.id)"
        >
          <div class="d-flex flex-column pa-4">
            <div class="d-flex justify-space-between">
              <div class="text-h6 font-weight-medium task-title">{{ task.name }}</div>
              <v-chip color="warning" size="small" class="task-status-chip ms-2 pulse-animation-warning">
                {{ t('spaces.detail.auditTasks.pendingReview') }}
              </v-chip>
            </div>

            <div class="text-body-2 text-medium-emphasis mt-2 task-description">{{ task.intro }}</div>

            <div class="d-flex flex-wrap align-center justify-space-between mt-3">
              <div class="d-flex align-center text-caption text-medium-emphasis creator-info">
                <v-avatar size="20" class="me-2" :image="getAvatarUrl(task.creator.avatarId)"></v-avatar>
                <span>{{ task.creator.nickname }} {{ t('spaces.detail.auditTasks.published') }}</span>
                <v-icon size="12" class="mx-1">mdi-circle-small</v-icon>
                <span>{{ dayjs(task.createdAt).format('MM-DD HH:mm') }}</span>
                <v-icon v-if="task.category" size="12" class="ms-2 me-1" color="primary">mdi-folder</v-icon>
                <span v-if="task.category" class="text-primary">{{ task.category.name }}</span>
              </div>

              <div class="d-flex align-center gap-3 mt-2 mt-sm-0">
                <div v-if="task.topics && task.topics.length > 0" class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="topic in task.topics"
                    :key="topic.id"
                    size="x-small"
                    variant="tonal"
                    class="task-topic-chip"
                  >
                    {{ topic.name }}
                  </v-chip>
                </div>
              </div>
            </div>

            <div class="d-flex align-center justify-end gap-3 mt-3">
              <div class="d-flex align-center text-caption">
                <v-icon size="small" color="primary" class="me-1">mdi-account-multiple</v-icon>
                <span>{{ task.submitters?.total || 0 }}</span>
              </div>
              <div class="d-flex align-center text-caption">
                <v-icon size="small" color="primary" class="me-1">mdi-alarm</v-icon>
                <span>{{ dayjs(task.deadline).format('MM-DD HH:mm') }}</span>
              </div>
            </div>
          </div>

          <v-expand-transition>
            <div v-show="expandedTaskId === task.id" class="detail-section px-4 pb-4">
              <v-divider class="mb-4"></v-divider>
              <div class="text-h6 mb-2">{{ t('spaces.detail.auditTasks.detailedInfo') }}</div>
              <div class="d-flex flex-row align-center mb-2" style="gap: 16px">
                <v-chip size="small" color="primary" variant="tonal">
                  {{
                    task.submitterType === 'TEAM'
                      ? t('spaces.detail.auditTasks.teamContest')
                      : t('spaces.detail.auditTasks.individualContest')
                  }}
                </v-chip>
                <v-chip
                  v-if="task.requireRealName"
                  size="small"
                  color="info"
                  variant="tonal"
                  prepend-icon="mdi-shield-account"
                >
                  需要实名信息
                </v-chip>
                <v-chip v-if="task.resubmittable" size="small" color="info" variant="tonal">{{
                  t('spaces.detail.auditTasks.resubmittable')
                }}</v-chip>
                <v-chip v-if="task.editable" size="small" color="info" variant="tonal">{{
                  t('spaces.detail.auditTasks.editableSubmission')
                }}</v-chip>
              </div>
              <div class="text-subtitle-2">{{ t('spaces.detail.auditTasks.description') }}</div>
              <TipTapViewer :value="parseDescription(task.description)" />
              <div class="text-subtitle-2 mt-2 mb-2">{{ t('spaces.detail.auditTasks.submissionRequirements') }}</div>
              <template v-if="task.submissionSchema.length > 0">
                <v-sheet
                  v-for="(entry, index) in task.submissionSchema"
                  :key="index"
                  flat
                  rounded="lg"
                  border
                  class="pa-4 mb-4 d-flex flex-row align-center"
                >
                  <v-chip size="small" color="primary" variant="outlined" class="mr-2">
                    {{ entry.type }}
                  </v-chip>
                  <div class="text-body-2">{{ entry.prompt }}</div>
                </v-sheet>
              </template>
              <div v-else class="text-subtitle-2 text-medium-emphasis">
                {{ t('spaces.detail.auditTasks.noRequirements') }}
              </div>
              <div class="d-flex flex-row align-center mt-4" style="gap: 16px">
                <v-btn color="primary" variant="tonal" @click.stop="approveTask(task.id)">{{
                  t('spaces.detail.auditTasks.approve')
                }}</v-btn>
                <v-btn color="error" variant="tonal" @click.stop="rejectTask(task.id)">{{
                  t('spaces.detail.auditTasks.reject')
                }}</v-btn>
              </div>
            </div>
          </v-expand-transition>
        </v-card>
      </infinite-scroll>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vuetify-sonner'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'

import { getAvatarUrl } from '@/utils/materials'
import { createEmptyResult, usePaging } from '@/utils/paging'

import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import { TasksApi } from '@/network/api/tasks'
import { CancelError, useDialog } from '@/plugins/dialog'
import { useSpaceStore } from '@/stores/space'

const TipTapViewer = defineAsyncComponent(() => import('@/components/common/Editor/TipTapViewer.vue'))

const spaceStore = useSpaceStore()
const { currentSpaceId } = storeToRefs(spaceStore)

const expandedTaskId = ref<number | null>(null)

const { t } = useI18n()
const dialogs = useDialog()

const {
  data: tasks,
  refresh,
  loadMore,
  reset,
  hasMore,
  refreshing,
  loadingMore,
} = usePaging(async (pageStart) => {
  if (!currentSpaceId.value) {
    return createEmptyResult<Task>()
  }
  const { data } = await TasksApi.list({
    space: currentSpaceId.value,
    pageStart: pageStart,
    sort_by: 'createdAt',
    sort_order: 'desc',
    approved: 'NONE',
    queryTopics: true,
    querySpace: true,
  })
  return { data: data.tasks, page: data.page }
})

const toggleExpand = (taskId: number) => {
  expandedTaskId.value = expandedTaskId.value === taskId ? null : taskId
}

const approveTask = async (taskId: number) => {
  try {
    await TasksApi.update(taskId, { approved: 'APPROVED' })
    toast.success(t('spaces.detail.auditTasks.operationSuccess'))
  } catch (error) {
    console.error(error)
    toast.error(t('spaces.detail.auditTasks.operationFailed'))
  } finally {
    await refresh()
  }
}

const rejectTask = async (taskId: number) => {
  try {
    const rejectReason = await dialogs
      .prompt(t('spaces.detail.auditTasks.rejectReason'), {
        title: t('spaces.detail.auditTasks.rejectReasonDialogTitle'),
        required: true,
      })
      .wait()
    if (!rejectReason) {
      toast.error(t('spaces.detail.auditTasks.rejectReasonRequired'))
      return
    }
    await TasksApi.update(taskId, { approved: 'DISAPPROVED', rejectReason })
    toast.success(t('spaces.detail.auditTasks.operationSuccess'))
  } catch (error) {
    if (error instanceof CancelError) {
      return
    }
    console.error(error)
    toast.error(t('spaces.detail.auditTasks.operationFailed'))
  } finally {
    await refresh()
  }
}

const parseDescription = (description: string) => {
  try {
    return JSON.parse(description)
  } catch (error) {
    return description
  }
}

onMounted(async () => {
  await refresh()
})
</script>

<style scoped lang="scss">
.tasks-list {
  padding: 16px;
  gap: 16px;

  .tasks-list-item:not(:last-child) {
    margin-bottom: 16px;
  }
}

.task-card {
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.09);
  cursor: pointer;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.15);
    background-color: rgba(var(--v-theme-primary), 0.02);

    .task-title {
      color: rgb(var(--v-theme-primary));
    }
  }
}

.task-title {
  transition: color 0.2s ease;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.creator-info {
  flex-wrap: nowrap;
  overflow: hidden;
  max-width: 100%;
  white-space: nowrap;
}

.task-status-chip {
  font-weight: 500;
  letter-spacing: 0;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.task-topic-chip,
.task-category-chip {
  font-weight: 400;
  letter-spacing: 0;
}

.detail-section {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.05);
}

.pulse-animation-warning {
  animation: pulse-warning 2s infinite;
}

@keyframes pulse-warning {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(var(--v-theme-warning), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0);
  }
}
</style>
