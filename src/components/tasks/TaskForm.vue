<template>
  <v-form ref="taskForm" @submit.prevent="submitForm">
    <v-text-field v-model="formData.name" :label="t('tasks.form.taskName')" required v-bind="nameProps"></v-text-field>
    <v-radio-group
      v-model="formData.submitterType"
      :label="t('tasks.form.participantType')"
      required
      inline
      :disabled="isEditing"
      v-bind="submitterTypeProps"
    >
      <v-radio :label="t('tasks.form.individual')" value="USER"></v-radio>
      <v-radio :label="t('tasks.form.team')" value="TEAM"></v-radio>
    </v-radio-group>
    <v-radio-group v-model="formData.rank" :label="t('tasks.form.taskLevel')" required inline v-bind="rankProps">
      <v-radio :label="t('tasks.form.beginner')" :value="1"></v-radio>
      <v-radio :label="t('tasks.form.intermediate')" :value="2"></v-radio>
      <v-radio :label="t('tasks.form.advanced')" :value="3"></v-radio>
    </v-radio-group>
    <v-date-input
      v-model="formData.deadline"
      :label="t('tasks.form.deadline')"
      required
      v-bind="deadlineProps"
      :allowed-dates="isAllowedDates"
    ></v-date-input>
    <v-text-field
      v-model.number="formData.defaultDeadline"
      :label="t('tasks.form.defaultDeadline')"
      type="number"
      required
      prefix="领取赛题后"
      suffix="天"
      min="1"
      v-bind="defaultDeadlineProps"
    ></v-text-field>
    <v-select
      v-model="formData.topics"
      :items="topicItems"
      :label="t('spaces.detail.tasks.topic')"
      chips
      multiple
      v-bind="topicsProps"
    ></v-select>

    <!-- 实名信息需求配置 -->
    <div class="real-name-section mt-4 mb-4">
      <div class="d-flex align-center mb-2">
        <div class="text-h6 font-weight-medium">实名信息要求</div>
        <v-chip v-if="formData.requireRealName" color="primary" size="small" class="ml-3" variant="flat">已启用</v-chip>
        <v-dialog v-model="privacyDialogOpen" max-width="600" persistent scrollable>
          <template #activator="{ props }">
            <v-btn variant="text" size="small" color="primary" class="ml-auto" v-bind="props">
              了解详情
              <v-icon end>mdi-information-outline</v-icon>
            </v-btn>
          </template>

          <v-card rounded="lg">
            <v-card-title class="d-flex align-center px-4 pt-4 pb-2">
              <v-icon color="primary" class="mr-3" size="28">mdi-shield-check</v-icon>
              <span class="text-h5 font-weight-medium">实名信息隐私保护</span>
            </v-card-title>

            <v-card-text class="px-4 pb-2">
              <p class="text-subtitle-2 font-weight-medium mb-4">
                为保护参与者隐私，我们对需要实名信息的赛题采取了多重保护措施：
              </p>

              <!-- 信息保护卡片 -->
              <v-card class="mb-5 privacy-protection-card" variant="flat" rounded="lg">
                <v-card-text class="pa-0">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="d-flex align-start pa-3">
                        <v-avatar size="36" class="primary-soft mr-3">
                          <v-icon icon="mdi-eye-off" size="20" color="primary"></v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-2 font-weight-medium mb-1">匿名参与</div>
                          <p class="text-body-2 text-medium-emphasis mb-0">
                            平台上的日常活动保持匿名，其他用户无法看到参与者的真实身份信息
                          </p>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6">
                      <div class="d-flex align-start pa-3">
                        <v-avatar size="36" class="primary-soft mr-3">
                          <v-icon icon="mdi-file-document-outline" size="20" color="primary"></v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-2 font-weight-medium mb-1">用途限制</div>
                          <p class="text-body-2 text-medium-emphasis mb-0">
                            实名信息仅用于身份验证、学分认定和评优评奖等必要场景
                          </p>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6">
                      <div class="d-flex align-start pa-3">
                        <v-avatar size="36" class="primary-soft mr-3">
                          <v-icon icon="mdi-shield-lock" size="20" color="primary"></v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-2 font-weight-medium mb-1">加密存储</div>
                          <p class="text-body-2 text-medium-emphasis mb-0">
                            采用端到端加密技术存储和传输实名信息，防止未授权访问
                          </p>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6">
                      <div class="d-flex align-start pa-3">
                        <v-avatar size="36" class="primary-soft mr-3">
                          <v-icon icon="mdi-history" size="20" color="primary"></v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-2 font-weight-medium mb-1">访问记录</div>
                          <p class="text-body-2 text-medium-emphasis mb-0">
                            所有对实名信息的访问都被记录，参与者可随时查看访问记录
                          </p>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- 使用场景 -->
              <div class="mb-4">
                <div class="text-subtitle-2 font-weight-medium mb-3">信息使用场景</div>
                <v-row dense>
                  <v-col cols="12" md="4">
                    <v-card variant="flat" rounded="lg" class="privacy-usage-card h-100">
                      <v-card-text class="pa-3">
                        <div class="d-flex align-start h-100">
                          <v-avatar size="36" class="primary-soft mr-3 mt-1">
                            <v-icon icon="mdi-account-check" size="20" color="primary"></v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-subtitle-2 font-weight-medium mb-1">身份验证</div>
                            <p class="text-body-2 text-medium-emphasis mb-0">验证参与者身份，帮助导师了解学生背景</p>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-card variant="flat" rounded="lg" class="privacy-usage-card h-100">
                      <v-card-text class="pa-3">
                        <div class="d-flex align-start h-100">
                          <v-avatar size="36" class="primary-soft mr-3 mt-1">
                            <v-icon icon="mdi-certificate-outline" size="20" color="primary"></v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-subtitle-2 font-weight-medium mb-1">项目认证</div>
                            <p class="text-body-2 text-medium-emphasis mb-0">用于赛题结题后的证书发放和学分认定</p>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-card variant="flat" rounded="lg" class="privacy-usage-card h-100">
                      <v-card-text class="pa-3">
                        <div class="d-flex align-start h-100">
                          <v-avatar size="36" class="primary-soft mr-3 mt-1">
                            <v-icon icon="mdi-trophy" size="20" color="primary"></v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-subtitle-2 font-weight-medium mb-1">评奖评优</div>
                            <p class="text-body-2 text-medium-emphasis mb-0">用于赛题结题后的奖项评定与项目评选</p>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <!-- 合规承诺 -->
              <v-alert
                type="info"
                variant="tonal"
                class="privacy-rights-alert mb-3"
                border="start"
                density="comfortable"
              >
                <div class="text-subtitle-2 font-weight-medium mb-1">合规承诺</div>
                <p class="text-body-2 mb-0">
                  作为赛题发布者，您应当严格遵守隐私保护规范，只有在必要的场景下才能查看参与者的实名信息。
                  平台会记录每次查看行为，并对滥用行为采取相应处罚。
                </p>
              </v-alert>
            </v-card-text>

            <v-card-actions class="pa-4 pt-2">
              <v-spacer></v-spacer>
              <v-btn color="secondary" variant="text" @click="cancelRequireRealName">取消</v-btn>
              <v-btn color="primary" variant="flat" @click="confirmRequireRealName">了解并接受</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>

      <v-card class="real-name-card" variant="flat" rounded="lg">
        <v-card-text class="pa-4">
          <div class="d-flex flex-column">
            <v-switch
              v-model="formData.requireRealName"
              color="primary"
              hide-details
              @update:model-value="handleRealNameToggle"
            >
              <template #label>
                <div class="d-flex align-center">
                  <v-icon
                    :icon="formData.requireRealName ? 'mdi-account-check' : 'mdi-account-outline'"
                    :color="formData.requireRealName ? 'primary' : 'medium-emphasis'"
                    class="mr-2"
                  ></v-icon>
                  <span>要求参与者提供实名信息</span>
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-icon size="small" color="primary" class="ml-2" v-bind="props">mdi-information-outline</v-icon>
                    </template>
                    <span>实名信息包括学生的真实姓名、学号、年级等信息</span>
                  </v-tooltip>
                </div>
              </template>
            </v-switch>

            <v-alert
              v-if="formData.requireRealName"
              color="primary"
              variant="tonal"
              class="mt-3 mb-0"
              density="comfortable"
              border="start"
            >
              <div class="d-flex align-start">
                <v-avatar color="primary" class="mr-3 mt-1" size="28">
                  <v-icon icon="mdi-shield-check" color="white" size="18"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-medium mb-1">您已选择要求实名信息</div>
                  <p class="text-body-2 mb-0">
                    • 参与者需完成实名认证方可参与此赛题<br />
                    • 所有信息经过加密存储，访问受到严格控制<br />
                    • 系统会记录所有对实名信息的访问行为
                  </p>
                </div>
              </div>
            </v-alert>

            <div v-else class="d-flex align-center mt-3">
              <v-icon color="medium-emphasis" icon="mdi-information-outline" class="mr-2"></v-icon>
              <span class="text-body-2 text-medium-emphasis">未启用实名认证要求，参与者可匿名参与此赛题</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- <div class="d-flex align-center gap-4">
      <v-checkbox
        v-model="formData.resubmittable"
        :label="t('tasks.form.allowMultipleSubmissions')"
        color="primary"
        v-bind="resubmittableProps"
      ></v-checkbox>
      <v-checkbox
        v-model="formData.editable"
        :label="t('tasks.form.allowEditSubmissions')"
        color="primary"
        v-bind="editableProps"
      ></v-checkbox>
    </div> -->
    <TipTapEditor
      ref="descriptionEditor"
      v-model="formData.description"
      output="json"
      rounded
      :min-height="200"
      :max-height="1000"
      editor-class="tiptap-editor"
      :title="t('tasks.form.taskDescription')"
    />
    <div class="d-flex justify-end mt-4">
      <v-btn type="submit" color="primary" :loading="isSubmitting">{{ submitButtonText }}</v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import type { TaskFormSubmitData as BaseTaskFormSubmitData, Topic } from '@/types'

import { computed, defineEmits, defineProps, nextTick, reactive, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { truncateString, vuetifyConfig } from '@/utils/form'

import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'

// Extend the TaskFormSubmitData type to include requireRealName
interface TaskFormSubmitData extends BaseTaskFormSubmitData {
  requireRealName?: boolean
}

const isAllowedDates = (date: unknown) => {
  if (!(date instanceof Date)) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date >= now
}

const props = withDefaults(
  defineProps<{
    initialData?: Partial<TaskFormSubmitData> | null
    submitButtonText: string
    isEditing?: boolean
    classificationTopics: Topic[]
  }>(),
  {
    initialData: null,
    submitButtonText: '提交',
    isEditing: false,
    classificationTopics: () => [],
  }
)

const { classificationTopics } = toRefs(props)
const display = useDisplay()

const topicItems = computed(() => classificationTopics.value.map((topic) => ({ title: topic.name, value: topic.id })))

const emit = defineEmits<{
  submit: [data: TaskFormSubmitData]
}>()

const { t } = useI18n()

const taskForm = ref(null)
const descriptionEditor = ref<InstanceType<typeof TipTapEditor> | null>(null)

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z.string().max(128),
      submitterType: z.enum(['USER', 'TEAM']),
      rank: z.number().int().min(1).max(3),
      deadline: z.date().default(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      defaultDeadline: z.number().int().min(1).default(30),
      topics: z.number().int().array().optional(),
      requireRealName: z.boolean().default(false),
    })
  ),
  initialValues: {
    ...(props.initialData ?? {}),
    deadline: props.initialData?.deadline
      ? new Date(props.initialData.deadline)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    requireRealName: props.initialData?.requireRealName ?? false,
  },
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [submitterType, submitterTypeProps] = defineField('submitterType', vuetifyConfig)
const [rank, rankProps] = defineField('rank', vuetifyConfig)
const [deadline, deadlineProps] = defineField('deadline', vuetifyConfig)
const [defaultDeadline, defaultDeadlineProps] = defineField('defaultDeadline', vuetifyConfig)
const [topics, topicsProps] = defineField('topics', vuetifyConfig)

const formData = reactive({
  name,
  submitterType,
  rank,
  deadline,
  defaultDeadline,
  topics,
  description: props.initialData?.description || { type: 'doc', content: [] },
  requireRealName: false,
})

const submitForm = handleSubmit((values) => {
  const descriptionText = descriptionEditor.value?.editor?.getText()
  const deadlineDate = new Date(values.deadline)
  deadlineDate.setHours(23, 59, 59, 999)
  const submissionData: TaskFormSubmitData = {
    ...values,
    description: JSON.stringify(formData.description),
    intro: truncateString(descriptionText || '', 255),
    deadline: deadlineDate.getTime(),
    resubmittable: true,
    editable: true,
    requireRealName: formData.requireRealName,
  }
  emit('submit', submissionData)
})

const privacyDialogOpen = ref(false)

const wasRealNameEnabled = ref(false)

const handleRealNameToggle = (value: boolean | null) => {
  if (value && !wasRealNameEnabled.value) {
    formData.requireRealName = false
    nextTick(() => {
      privacyDialogOpen.value = true
    })
  }
  wasRealNameEnabled.value = !!formData.requireRealName
}

const cancelRequireRealName = () => {
  formData.requireRealName = false
  wasRealNameEnabled.value = false
  privacyDialogOpen.value = false
}

const confirmRequireRealName = () => {
  formData.requireRealName = true
  wasRealNameEnabled.value = true
  privacyDialogOpen.value = false
}

// 初始化wasRealNameEnabled
wasRealNameEnabled.value = !!props.initialData?.requireRealName
</script>

<style scoped>
.real-name-section {
  position: relative;
}

.real-name-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.real-name-option {
  min-width: 280px;
}

.privacy-notice {
  min-width: 320px;
  flex-grow: 1;
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

.tiptap-editor {
  margin-top: 16px;
}
</style>
