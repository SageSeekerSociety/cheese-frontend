<template>
  <v-card flat rounded="lg">
    <template #title>
      <v-icon left size="24">mdi-history</v-icon>
      提交记录
    </template>
    <template #text>
      <infinite-scroll
        :has-more="hasMore"
        :loading="loadingMore"
        :initial-loading="refreshing"
        :is-empty="submissions.length === 0"
        force-manual
        @load-more="loadMore"
      >
        <template #empty>
          <v-empty-state title="暂无提交记录" />
        </template>
        <v-expansion-panels>
          <template v-for="submission in submissions" :key="submission.id">
            <v-expansion-panel :elevation="0" ripple>
              <template #title>
                <div class="d-flex flex-row align-center">
                  <v-chip color="primary" variant="tonal" size="small"> #{{ submission.version }} </v-chip>
                  <span class="ml-2">
                    {{ submission.submitter.nickname }} 提交于
                    {{ dayjs(submission.createdAt).format('YYYY-MM-DD HH:mm') }}
                  </span>
                  <div class="flex-grow-1"></div>
                </div>
              </template>
              <template #text>
                <div
                  v-for="(content, index) in submission.content"
                  :key="index"
                  :class="{ 'mb-2': index < submission.content.length - 1 }"
                >
                  <div class="d-flex flex-row align-center">
                    <v-icon v-if="content.type === 'TEXT'">mdi-text</v-icon>
                    <v-icon v-else-if="content.type === 'FILE'">mdi-file-document-outline</v-icon>
                    <span class="text-h6">{{ content.title }}</span>
                  </div>
                  <div v-if="content.contentText">{{ content.contentText }}</div>
                  <div v-else-if="content.contentAttachment">
                    <v-card
                      border
                      flat
                      class="file-card d-flex flex-row align-center"
                      :href="getFullAttachmentUrl(content.contentAttachment.url)"
                      target="_blank"
                    >
                      <v-icon class="text-medium-emphasis" size="36">mdi-file-document-outline</v-icon>
                      <div class="d-flex flex-column">
                        <div class="text-body-1">{{ (content.contentAttachment.meta as FileMeta).name }}</div>
                        <div class="text-caption">{{ formatFileSize(content.contentAttachment.meta.size) }}</div>
                      </div>
                    </v-card>
                  </div>
                </div>
              </template>
            </v-expansion-panel>
          </template>
        </v-expansion-panels>
      </infinite-scroll>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { TasksApi } from '@/network/api/tasks'
import { FileMeta } from '@/types'
import dayjs from 'dayjs'
import { getFullAttachmentUrl, formatFileSize } from '@/utils/materials'
import { usePaging } from '@/utils/paging'
import InfiniteScroll from '@/components/common/InfiniteScroll.vue'

const props = defineProps<{
  taskId: number
  memberId: number
}>()

const {
  data: submissions,
  error,
  refresh,
  loadMore,
  hasMore,
  refreshing,
  loadingMore,
} = usePaging(async (pageStart) => {
  const { data } = await TasksApi.listSubmissions(props.taskId, {
    member: props.memberId,
    allVersions: true,
    sort_by: 'createdAt',
    sort_order: 'desc',
    page_start: pageStart,
    page_size: 10,
  })
  return { data: data.submissions, page: data.page }
})

onMounted(refresh)

watch(() => [props.taskId, props.memberId], refresh)

defineExpose({
  refresh,
})
</script>

<style scoped>
.file-card {
  gap: 4px;
  padding: 8px;
}
</style>
