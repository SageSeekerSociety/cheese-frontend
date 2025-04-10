<template>
  <div>
    <v-card flat rounded="lg" class="mb-6">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-icon color="primary" size="28">mdi-upload</v-icon>
          </div>
        </template>
        <v-card-title class="text-h6 ps-0">提交表单</v-card-title>
        <template #append>
          <CountdownTimer v-if="userDeadline" :deadline="userDeadline" label="提交剩余时间" />
        </template>
      </v-card-item>

      <v-divider class="mx-4"></v-divider>

      <v-card-text class="py-6">
        <v-alert v-if="!taskData?.submittable" type="warning" class="mb-6" variant="tonal">
          当前不可提交，请联系赛题发布者获取提交权限。
        </v-alert>

        <v-alert v-else-if="!hasValidIdentity" type="warning" class="mb-6" variant="tonal">
          <template #title>无可用身份</template>
          <template #text>
            <p>您没有可用于提交的身份。可能是因为您尚未加入该赛题或者您的身份尚未获得批准。</p>
          </template>
        </v-alert>

        <v-alert v-else-if="reachedSubmissionLimit" type="warning" class="mb-6" variant="tonal">
          <template #title>已达到提交次数上限</template>
          <template #text>
            <p>该赛题不允许重复提交，您已经提交过作品。</p>
            <div class="mt-2">
              <v-btn color="primary" variant="text" :to="{ name: 'TasksSubmissions', params: { taskId: taskData.id } }"
                >查看我的提交记录</v-btn
              >
            </div>
          </template>
        </v-alert>

        <template v-else-if="submissionIdentities.length > 1">
          <!-- 如果有多个可提交身份，显示选择器 -->
          <v-card class="mb-6" variant="outlined">
            <v-card-text>
              <div class="text-subtitle-1 font-weight-medium mb-3">请选择您要使用的提交身份：</div>
              <v-radio-group v-model="selectedIdentityId" class="mt-2">
                <v-radio
                  v-for="identity in submissionIdentities"
                  :key="identity.id"
                  :value="identity.id"
                  :label="identity.type === 'TEAM' ? `队伍: ${identity.teamName || '未命名队伍'}` : '个人身份'"
                ></v-radio>
              </v-radio-group>
            </v-card-text>
          </v-card>
        </template>

        <v-form v-if="canSubmit" ref="formRef" @submit.prevent="submitTask">
          <div class="form-container">
            <template v-for="(entry, index) in submissionSchema" :key="index">
              <div class="submission-entry pb-4 mb-4" :class="{ 'border-bottom': index < submissionSchema.length - 1 }">
                <div class="d-flex align-center mb-3">
                  <div class="me-auto">
                    <div class="text-subtitle-1 font-weight-medium">{{ entry.prompt }}</div>
                  </div>
                  <v-chip size="small" :color="getTypeColor(entry.type)" variant="flat">{{
                    getTypeText(entry.type)
                  }}</v-chip>
                </div>

                <v-fade-transition>
                  <div>
                    <template v-if="entry.type === 'TEXT'">
                      <v-textarea
                        v-model="submissionContent[index].contentText"
                        :label="entry.prompt"
                        :placeholder="`请输入${entry.prompt}`"
                        variant="outlined"
                        :rules="[(v) => !!v || '此项为必填项']"
                        hide-details="auto"
                        class="submission-input"
                      ></v-textarea>
                    </template>

                    <template v-else-if="entry.type === 'FILE'">
                      <v-file-input
                        v-model="submissionContent[index].contentAttachment"
                        :label="entry.prompt"
                        :placeholder="`请上传${entry.prompt}`"
                        variant="outlined"
                        :rules="[(v) => !!v || '此项为必填项']"
                        hide-details="auto"
                        prepend-icon=""
                        class="submission-input"
                      >
                        <template #prepend>
                          <v-icon color="primary" class="mr-2">mdi-paperclip</v-icon>
                        </template>
                        <template #selection="{ fileNames }">
                          <v-chip color="primary" variant="outlined" label class="mt-1">
                            <v-icon start>mdi-file</v-icon>
                            {{ fileNames[0] }}
                          </v-chip>
                        </template>
                      </v-file-input>
                    </template>
                  </div>
                </v-fade-transition>
              </div>
            </template>

            <div class="d-flex justify-end mt-4">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                rounded="pill"
                :loading="submitting"
                :disabled="submitting || !canSubmit"
                min-width="120"
                class="px-8"
              >
                <v-icon start>mdi-check</v-icon>
                提交
              </v-btn>
            </div>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card flat rounded="lg" class="mt-6">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-icon color="info" size="28">mdi-information-outline</v-icon>
          </div>
        </template>
        <v-card-title class="text-h6 ps-0">提交须知</v-card-title>
      </v-card-item>

      <v-card-text>
        <v-list>
          <v-list-item prepend-icon="mdi-check-circle-outline" class="ps-2">
            <v-list-item-title>确保您的提交内容符合赛题要求，并且所有必填项均已填写完整</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-file-upload-outline" class="ps-2">
            <v-list-item-title>上传的文件大小不得超过50MB，支持常见文档和压缩包格式</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="taskData?.resubmittable" prepend-icon="mdi-refresh" class="ps-2">
            <v-list-item-title>该赛题允许多次提交，您可以在截止日期前多次更新您的作品</v-list-item-title>
          </v-list-item>
          <v-list-item v-else prepend-icon="mdi-alert-circle-outline" class="ps-2">
            <v-list-item-title class="text-warning"
              >该赛题仅允许提交一次，提交后将无法修改，请谨慎操作</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 上传进度对话框 -->
    <v-dialog v-model="progressDialog" persistent max-width="480" class="upload-progress-dialog">
      <v-card rounded="lg" class="pa-6">
        <v-card-title class="text-h6 d-flex align-center pb-3">
          <v-icon color="primary" class="mr-3">mdi-cloud-upload</v-icon>
          正在上传提交内容
        </v-card-title>

        <v-card-text class="pt-3">
          <div class="mb-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-body-1 text-medium-emphasis">
                {{ currentFileName }}
              </div>
              <div
                class="text-body-2 font-weight-medium"
                :class="uploadProgress === 100 ? 'text-success' : 'text-primary'"
              >
                {{ uploadProgress }}%
              </div>
            </div>

            <v-progress-linear
              :model-value="uploadProgress"
              height="8"
              color="primary"
              rounded
              :stream="uploadProgress < 100"
            ></v-progress-linear>

            <div class="d-flex align-center justify-space-between mt-3 text-body-2 text-medium-emphasis">
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-speedometer</v-icon>
                {{ uploadSpeed }}
              </div>
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                剩余 {{ timeRemaining }}
              </div>
            </div>
          </div>

          <div class="text-body-2 text-medium-emphasis text-center">上传完成后将自动进行下一步</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { TaskParticipationIdentity, TaskParticipationInfo } from '@/network/api/tasks/types'
import type { Task, TaskMembership } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { throttle } from 'lodash-es'

import { AttachmentsApi } from '@/network/api/attachments'
import { TasksApi } from '@/network/api/tasks'
import AccountService from '@/services/account'

const CountdownTimer = defineAsyncComponent(() => import('@/components/common/CountdownTimer.vue'))

const props = defineProps<{
  taskData: Task | null
  participationInfo?: TaskParticipationInfo
}>()

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const progressDialog = ref(false)
const uploadProgress = ref(0)
const currentFileName = ref('')
const uploadSpeed = ref('0 KB/s')
const timeRemaining = ref('')
const participants = ref<TaskMembership[]>([])
const selectedIdentityId = ref<number | null>(null)

// 计算有效的提交身份（已通过审核且可提交的）
const submissionIdentities = computed(() => {
  if (!props.participationInfo?.identities) return []
  return props.participationInfo.identities.filter((id) => id.approved === 'APPROVED' && id.canSubmit)
})

// 是否有有效的提交身份
const hasValidIdentity = computed(() => {
  return submissionIdentities.value.length > 0
})

// 当前选中的身份
const currentIdentity = computed(() => {
  if (!selectedIdentityId.value || !submissionIdentities.value.length) {
    return submissionIdentities.value[0] || null
  }
  return submissionIdentities.value.find((id) => id.id === selectedIdentityId.value) || submissionIdentities.value[0]
})

// 是否可以提交
const canSubmit = computed(() => {
  return props.taskData?.submittable && hasValidIdentity.value && !reachedSubmissionLimit.value
})

// 提交数据
const submissionSchema = computed(() => props.taskData?.submissionSchema || [])
const submissionContent = ref<{ contentText?: string; contentAttachment?: File }[]>(
  props.taskData?.submissionSchema?.map(() => ({ contentText: '', contentAttachment: undefined })) || []
)

const fetchParticipants = async (queryRealNameInfo = false) => {
  if (!props.taskData) return
  const { data } = await TasksApi.getParticipants(props.taskData.id, { queryRealNameInfo })
  participants.value = data.participants
}

// 用户截止时间
const userDeadline = computed(() => {
  if (!props.taskData || !currentIdentity.value) return null

  // 获取当前参与身份对应的成员的截止时间
  const participantInfo = participants.value.find((p) => p.id === currentIdentity.value?.id)

  return participantInfo?.deadline || null
})

// 是否已达到提交次数上限（对于不可重复提交的任务）
const reachedSubmissionLimit = computed(() => {
  if (!props.taskData) return false
  if (props.taskData.resubmittable) return false

  return false
})

// 节流的进度更新函数
const updateProgress = throttle((progressEvent: any) => {
  const { loaded, total } = progressEvent
  uploadProgress.value = Math.round((loaded / total) * 100)

  // 计算上传速度
  const speed = progressEvent.rate || 0
  if (speed < 1024) {
    uploadSpeed.value = `${speed.toFixed(1)} B/s`
  } else if (speed < 1024 * 1024) {
    uploadSpeed.value = `${(speed / 1024).toFixed(1)} KB/s`
  } else {
    uploadSpeed.value = `${(speed / (1024 * 1024)).toFixed(1)} MB/s`
  }

  // 计算剩余时间
  const remaining = (total - loaded) / speed
  if (remaining < 60) {
    timeRemaining.value = `${Math.ceil(remaining)}秒`
  } else if (remaining < 3600) {
    timeRemaining.value = `${Math.ceil(remaining / 60)}分钟`
  } else {
    timeRemaining.value = `${Math.floor(remaining / 3600)}小时${Math.ceil((remaining % 3600) / 60)}分钟`
  }
}, 200)

// 初始化提交内容
onMounted(() => {
  if (props.taskData) {
    fetchParticipants()

    // 如果有有效的提交身份，初始化选择第一个
    if (submissionIdentities.value.length > 0) {
      selectedIdentityId.value = submissionIdentities.value[0].id
    }
  }
})

// 监听身份变化
watch(
  () => props.participationInfo,
  (newVal) => {
    if (newVal?.identities && newVal.identities.length > 0) {
      // 尝试查找有效的提交身份
      const validIdentity = newVal.identities.find((id) => id.approved === 'APPROVED' && id.canSubmit)
      if (validIdentity) {
        selectedIdentityId.value = validIdentity.id
      } else if (newVal.identities.length > 0) {
        selectedIdentityId.value = newVal.identities[0].id
      }
    }
  },
  { immediate: true }
)

// 获取类型展示文本
const getTypeText = (type: string) => {
  switch (type) {
    case 'TEXT':
      return '文本输入'
    case 'FILE':
      return '文件上传'
    default:
      return type
  }
}

// 获取类型对应的颜色
const getTypeColor = (type: string) => {
  switch (type) {
    case 'TEXT':
      return 'primary'
    case 'FILE':
      return 'success'
    default:
      return 'grey'
  }
}

// 提交任务
const submitTask = async () => {
  if (!props.taskData || !currentIdentity.value) return

  // 检查表单是否填写完整
  const isFormValid = submissionContent.value.every((item, index) => {
    const schema = submissionSchema.value[index]
    if (schema.type === 'TEXT') {
      return !!item.contentText
    } else if (schema.type === 'FILE') {
      return !!item.contentAttachment
    }
    return true
  })

  if (!isFormValid) {
    toast.error('请填写完整所有必填项')
    return
  }

  submitting.value = true
  progressDialog.value = true
  uploadProgress.value = 0

  try {
    // 处理文件上传
    let uploadedFiles = 0

    const finalSubmissionContent = submissionContent.value.map((item) => {
      if (item.contentAttachment) {
        return {} as { text?: string; attachmentId?: number }
      }
      return {
        text: item.contentText,
      } as { text?: string; attachmentId?: number }
    })

    // 上传文件
    for (const [index, entry] of submissionContent.value.entries()) {
      if (entry.contentAttachment) {
        try {
          currentFileName.value = entry.contentAttachment.name
          uploadProgress.value = 0
          uploadSpeed.value = '0 KB/s'
          timeRemaining.value = '计算中...'

          const { data } = await AttachmentsApi.upload(
            {
              type: 'file',
              file: entry.contentAttachment,
            },
            updateProgress
          )

          finalSubmissionContent[index].attachmentId = data.id
          uploadedFiles++
        } catch (error) {
          toast.error(`上传附件失败: ${error instanceof Error ? error.message : '未知错误'}`)
          progressDialog.value = false
          submitting.value = false
          return
        }
      }
    }

    // 使用参与者ID而不是成员ID进行提交
    await TasksApi.createSubmission(props.taskData.id, currentIdentity.value.id, finalSubmissionContent)
    toast.success('提交成功')

    // 跳转到提交记录页面
    router.push({
      name: 'TasksSubmissions',
      params: { taskId: props.taskData.id },
    })
  } catch (error) {
    toast.error(`提交失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    progressDialog.value = false
    submitting.value = false
  }
}
</script>

<style scoped>
.submission-entry {
  transition: all 0.3s ease;
}

.submission-input {
  transition: all 0.2s ease;
}

.submission-input:focus-within {
  transform: translateY(-2px);
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity-variant));
}

.form-container {
  max-width: 900px;
  margin: 0 auto;
}

.upload-progress-dialog :deep(.v-card) {
  overflow: hidden;
}
</style>
