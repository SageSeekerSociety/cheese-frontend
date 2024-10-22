<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="t('spaces.detail.auditTasks.title')" color="transparent" density="compact"></v-toolbar>
    <div class="tasks-list">
      <infinite-scroll
        :loading="loadingMore"
        :has-more="hasMore"
        :initial-loading="refreshing"
        :is-empty="tasks.length === 0"
        :on-load-more="loadMore"
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
          class="pa-4 tasks-list-item"
          @click="toggleExpand(task.id)"
        >
          <div class="d-flex flex-row">
            <div class="d-flex flex-column flex-grow-1">
              <div class="text-subtitle-2 text-medium-emphasis">
                {{
                  t('spaces.detail.auditTasks.publishedAt', {
                    publisher: task.creator.nickname,
                    time: dayjs(task.createdAt).format('YYYY-MM-DD HH:mm'),
                  })
                }}
              </div>
              <div class="text-h6">{{ task.name }}</div>
              <div class="text-subtitle-1 text-medium-emphasis task-description">{{ task.intro }}</div>
            </div>
            <div class="d-flex flex-column align-end flex-shrink-0">
              <div class="text-subtitle-2 text-medium-emphasis">
                <v-icon left>mdi-alarm</v-icon>
                {{ t('spaces.detail.auditTasks.deadline') }}: {{ dayjs(task.deadline).format('YYYY-MM-DD HH:mm') }}
              </div>
            </div>
          </div>
          <v-expand-transition>
            <div v-show="expandedTaskId === task.id" class="mt-4">
              <div class="text-h6 mb-2">{{ t('spaces.detail.auditTasks.detailedInfo') }}</div>
              <div class="d-flex flex-row align-center mb-2" style="gap: 16px">
                <v-chip size="small" color="primary" variant="tonal">
                  {{
                    task.submitterType === 'TEAM'
                      ? t('spaces.detail.auditTasks.teamContest')
                      : t('spaces.detail.auditTasks.individualContest')
                  }}
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
import { TasksApi } from '@/network/api/tasks'
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { usePaging, createEmptyResult } from '@/utils/paging'
import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import TipTapViewer from '@/components/common/Editor/TipTapViewer.vue'
import { toast } from 'vuetify-sonner'
import { useSpaceStore } from '@/store/space'
import { storeToRefs } from 'pinia'
import { Task } from '@/types'
import { useI18n } from 'vue-i18n'

const spaceStore = useSpaceStore()
const { currentSpaceId } = storeToRefs(spaceStore)

const expandedTaskId = ref<number | null>(null)

const { t } = useI18n()

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
    page_start: pageStart,
    sort_by: 'createdAt',
    sort_order: 'desc',
    approved: false,
  })
  return { data: data.tasks, page: data.page }
})

const toggleExpand = (taskId: number) => {
  expandedTaskId.value = expandedTaskId.value === taskId ? null : taskId
}

const approveTask = async (taskId: number) => {
  try {
    await TasksApi.update(taskId, { approved: true })
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
    await TasksApi.update(taskId, { approved: false })
    toast.success(t('spaces.detail.auditTasks.operationSuccess'))
  } catch (error) {
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
.tasks-header {
  gap: 8px;
}

.tasks-header-selects {
  gap: 8px;
}

.tasks-list {
  padding: 16px;
  gap: 16px;

  .tasks-list-item:not(:last-child) {
    margin-bottom: 16px;
  }
}

.tasks-list-item {
  gap: 16px;
}

.task-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
