<template>
  <v-card v-if="submissions.length" flat rounded="lg">
    <template #title> 最新提交 </template>
    <template #text>
      <v-card border flat rounded="lg" class="pa-4">
        <div class="d-flex flex-row align-center mb-2">
          <v-chip color="primary" variant="tonal" size="small"> #{{ latestSubmission.version }} </v-chip>
          <span class="ml-2">
            {{ latestSubmission.submitter.nickname }} 提交于
            {{ dayjs(latestSubmission.createdAt).format('YYYY-MM-DD HH:mm') }}
          </span>
          <div class="flex-grow-1"></div>
          <v-chip
            v-if="latestSubmission.review"
            size="small"
            variant="tonal"
            :color="calcSubmissionReviewColor(latestSubmission.review)"
          >
            {{ calcSubmissionReviewText(latestSubmission.review) }}
          </v-chip>
        </div>
        <div v-for="(content, index) in latestSubmission.content" :key="index">
          <SubmissionContentCard
            :content="content"
            :class="{ 'mb-2': index !== latestSubmission.content.length - 1 }"
          />
        </div>
      </v-card>

      <v-card v-if="reviewable" flat rounded="lg" border class="mt-4">
        <template #title> {{ latestSubmission.review?.reviewed ? '修改评审' : '评审' }} </template>
        <template #text>
          <v-form @submit.prevent="submitReview">
            <v-radio-group v-model="accepted" inline label="是否通过" v-bind="acceptedProps">
              <v-radio label="通过" :value="true"></v-radio>
              <v-radio label="驳回" :value="false"></v-radio>
            </v-radio-group>
            <v-text-field v-model.number="score" label="评分" type="number" min="0" max="100" v-bind="scoreProps" />
            <v-textarea v-model="comment" label="评论" v-bind="commentProps" />
          </v-form>
        </template>
        <template #actions>
          <v-btn v-if="latestSubmission.review?.reviewed" color="error" variant="tonal" @click="cancelReview">
            撤销评审
          </v-btn>
          <v-btn color="primary" variant="tonal" :loading="isSubmitting" :disabled="isSubmitting" @click="submitReview">
            提交
          </v-btn>
        </template>
      </v-card>
      <SubmissionReviewStatus v-else-if="latestSubmission.review" class="mt-4" :review="latestSubmission.review" />
    </template>
  </v-card>

  <v-card flat rounded="lg" class="mt-4">
    <template v-if="submissions.length" #title> 历史提交 </template>
    <infinite-scroll
      :has-more="hasMore"
      :loading="loadingMore"
      :initial-loading="refreshing"
      :is-empty="submissions.length <= 1"
      force-manual
      @load-more="loadMore"
    >
      <template #empty>
        <v-empty-state title="暂无历史提交记录" />
      </template>
      <v-expansion-panels>
        <template v-for="submission in submissions.slice(1)" :key="submission.id">
          <v-expansion-panel :elevation="0" ripple>
            <template #title>
              <div class="d-flex flex-row align-center">
                <v-chip color="primary" variant="tonal" size="small"> #{{ submission.version }} </v-chip>
                <span class="ml-2">
                  {{ submission.submitter.nickname }} 提交于
                  {{ dayjs(submission.createdAt).format('YYYY-MM-DD HH:mm') }}
                </span>
                <div class="flex-grow-1"></div>
                <v-chip
                  v-if="submission.review"
                  size="small"
                  variant="tonal"
                  :color="calcSubmissionReviewColor(submission.review)"
                >
                  {{ calcSubmissionReviewText(submission.review) }}
                </v-chip>
              </div>
            </template>
            <template #text>
              <div v-for="(content, index) in submission.content" :key="index">
                <SubmissionContentCard
                  :content="content"
                  :class="{ 'mb-2': index !== submission.content.length - 1 }"
                />
              </div>
              <SubmissionReviewStatus v-if="submission.review" class="mt-4" :review="submission.review" />
            </template>
          </v-expansion-panel>
        </template>
      </v-expansion-panels>
    </infinite-scroll>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { TasksApi } from '@/network/api/tasks'
import dayjs from 'dayjs'
import { usePaging } from '@/utils/paging'
import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import SubmissionContentCard from './SubmissionContentCard.vue'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { vuetifyConfig } from '@/utils/form'
import { TaskSubmissionReview } from '@/types'
import { toast } from 'vuetify-sonner'
import SubmissionReviewStatus from './SubmissionReviewStatus.vue'

const {
  taskId,
  memberId,
  reviewable = false,
} = defineProps<{
  taskId: number
  memberId: number
  reviewable?: boolean
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
  const { data } = await TasksApi.listSubmissions(taskId, {
    member: memberId,
    allVersions: true,
    sort_by: 'createdAt',
    sort_order: 'desc',
    page_start: pageStart,
    page_size: 10,
    queryReview: true,
  })
  return { data: data.submissions, page: data.page }
})

const latestSubmission = computed(() => submissions.value[0])
const historySubmissions = computed(() => submissions.value.slice(1))

const calcSubmissionReviewColor = (review: TaskSubmissionReview) => {
  if (!review) {
    return 'text'
  }
  if (!review.reviewed) {
    return 'text'
  }
  if (review.detail.accepted) {
    return 'success'
  }
  return 'error'
}

const calcSubmissionReviewText = (review: TaskSubmissionReview) => {
  if (!review || !review.reviewed) {
    return '未评审'
  }
  return review.detail.accepted ? '通过' : '驳回'
}

const { handleSubmit, defineField, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      accepted: z.boolean().optional().default(true),
      score: z.number().min(0).max(100),
      comment: z.string().max(255).optional().default(''),
    })
  ),
})

const [accepted, acceptedProps] = defineField('accepted', vuetifyConfig)
const [score, scoreProps] = defineField('score', vuetifyConfig)
const [comment, commentProps] = defineField('comment', vuetifyConfig)

const submitReview = handleSubmit(async (values) => {
  if (latestSubmission.value.review && latestSubmission.value.review.reviewed) {
    try {
      await TasksApi.patchSubmissionReview(latestSubmission.value.id, values)
      toast.success('修改评审成功')
    } catch (error) {
      toast.error('修改评审失败')
      console.error(error)
    } finally {
      refresh()
    }
  } else {
    try {
      await TasksApi.postSubmissionReview(latestSubmission.value.id, values)
      toast.success('评审成功')
    } catch (error) {
      toast.error('评审失败')
      console.error(error)
    } finally {
      refresh()
    }
  }
})

const cancelReview = async () => {
  if (latestSubmission.value.review) {
    try {
      await TasksApi.deleteSubmissionReview(latestSubmission.value.id)
      toast.success('取消评审成功')
    } catch (error) {
      toast.error('取消评审失败')
      console.error(error)
    } finally {
      refresh()
    }
  }
}

onMounted(refresh)

watch(() => [taskId, memberId], refresh)

watch(latestSubmission, (newVal) => {
  if (reviewable && newVal.review) {
    if (newVal.review.reviewed) {
      accepted.value = newVal.review.detail.accepted
      score.value = newVal.review.detail.score
      comment.value = newVal.review.detail.comment
    } else {
      resetForm()
    }
  }
})

defineExpose({
  refresh,
})
</script>

<style scoped>
/* 移除了 .file-card 样式,因为它现在在 SubmissionContentCard 组件中 */
</style>
