<template>
  <v-form ref="taskForm" @submit.prevent="submitForm">
    <!-- 基本信息卡片 -->
    <v-card flat rounded="lg" class="mb-4 form-card">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
              <v-icon color="primary" size="28">mdi-information-outline</v-icon>
            </v-avatar>
          </div>
        </template>
        <v-card-title class="text-h5 ps-0">基本信息</v-card-title>
      </v-card-item>

      <v-card-text class="pt-2">
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="name" :label="t('tasks.form.taskName')" required v-bind="nameProps"></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-radio-group
              v-model="submitterType"
              :label="t('tasks.form.participantType')"
              required
              inline
              :disabled="isEditing"
              v-bind="submitterTypeProps"
              class="mt-0"
            >
              <v-radio :label="t('tasks.form.individual')" value="USER"></v-radio>
              <v-radio :label="t('tasks.form.team')" value="TEAM"></v-radio>
            </v-radio-group>
          </v-col>

          <v-col cols="12" md="6">
            <v-radio-group
              v-model="rank"
              :label="t('tasks.form.taskLevel')"
              required
              inline
              v-bind="rankProps"
              class="mt-0"
            >
              <v-radio :label="t('tasks.form.beginner')" :value="1"></v-radio>
              <v-radio :label="t('tasks.form.intermediate')" :value="2"></v-radio>
              <v-radio :label="t('tasks.form.advanced')" :value="3"></v-radio>
            </v-radio-group>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="participantLimit"
              :label="submitterType === 'TEAM' ? '队伍数量限制' : '参与者人数限制'"
              type="number"
              min="1"
              v-bind="participantLimitProps"
              :hint="t('tasks.form.participantLimitHint')"
            >
              <template #append-inner>
                <v-icon size="small" color="primary">mdi-account-group</v-icon>
              </template>
            </v-text-field>
          </v-col>

          <!-- 小队人数限制 -->
          <template v-if="submitterType === 'TEAM'">
            <v-col cols="12" md="6">
              <v-select
                v-model="teamLockingPolicy"
                :label="t('tasks.form.teamLockingPolicy')"
                required
                v-bind="teamLockingPolicyProps"
                density="comfortable"
                :items="[
                  {
                    title: t('tasks.form.teamLockingPolicyNoLock'),
                    value: 'NO_LOCK',
                    description: t('tasks.form.teamLockingPolicyNoLockDesc'),
                  },
                  {
                    title: t('tasks.form.teamLockingPolicyLockOnApproval'),
                    value: 'LOCK_ON_APPROVAL',
                    description: t('tasks.form.teamLockingPolicyLockOnApprovalDesc'),
                  },
                ]"
                item-title="title"
                item-value="value"
              >
                <template #prepend-inner>
                  <v-icon size="small" color="primary">mdi-lock-outline</v-icon>
                </template>
                <template #item="{ item, props: slotProps }">
                  <v-list-item v-bind="slotProps">
                    <template #prepend>
                      <v-icon
                        :icon="item.raw && item.raw.value === 'NO_LOCK' ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                        color="primary"
                        class="mr-2"
                      ></v-icon>
                    </template>
                    <v-list-item-subtitle class="text-wrap">{{
                      item.raw ? item.raw.description : item.description
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="minTeamSize"
                label="最小队伍人数"
                type="number"
                required
                min="1"
                v-bind="minTeamSizeProps"
              >
                <template #append-inner>
                  <v-icon size="small" color="primary">mdi-account-multiple-outline</v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="maxTeamSize"
                label="最大队伍人数"
                type="number"
                required
                min="1"
                v-bind="maxTeamSizeProps"
              >
                <template #append-inner>
                  <v-icon size="small" color="primary">mdi-account-group</v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12">
              <v-alert
                color="info"
                variant="tonal"
                density="comfortable"
                border="start"
                class="mt-2"
                icon="mdi-information-outline"
              >
                <div class="text-subtitle-2 font-weight-medium mb-1">{{ t('tasks.form.teamMemberManagement') }}</div>
                <p class="text-body-2 mb-0">
                  • 系统会在参与申请被审核通过时<strong>记录当前的队伍成员名单</strong><br />
                  • 无论选择哪种策略，最终的参与记录都只会基于审核通过时的成员名单<br />
                  • <strong>允许自由调整</strong>：队伍可以继续添加/移除成员，但这些变动不会影响已记录的参与情况<br />
                  • <strong>审核通过后锁定</strong>：队伍成员将被锁定，无法再进行任何成员变更
                </p>
              </v-alert>
            </v-col>
          </template>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 时间设置卡片 -->
    <v-card flat rounded="lg" class="mb-4 form-card">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
              <v-icon color="primary" size="28">mdi-clock-outline</v-icon>
            </v-avatar>
          </div>
        </template>
        <v-card-title class="text-h5 ps-0">时间设置</v-card-title>
      </v-card-item>

      <v-card-text class="pt-2">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-date-input
              v-model="deadline"
              :label="t('tasks.form.deadline')"
              required
              density="comfortable"
              v-bind="deadlineProps"
              :allowed-dates="isAllowedDates"
            ></v-date-input>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="defaultDeadline"
              :label="t('tasks.form.defaultDeadline')"
              type="number"
              required
              prefix="领取赛题后"
              suffix="天"
              min="1"
              v-bind="defaultDeadlineProps"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 分类标签 -->
    <v-card flat rounded="lg" class="mb-4 form-card">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
              <v-icon color="primary" size="28">mdi-tag-multiple</v-icon>
            </v-avatar>
          </div>
        </template>
        <v-card-title class="text-h5 ps-0">分类标签</v-card-title>
      </v-card-item>

      <v-card-text class="pt-2">
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-if="categories.length > 0"
              v-model="categoryId"
              :items="categoryItems"
              :label="t('spaces.detail.tasks.category')"
              item-title="title"
              item-value="value"
              v-bind="categoryIdProps"
            >
              <template #prepend-inner>
                <v-icon size="small">mdi-shape</v-icon>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="topics"
              :items="topicItems"
              :label="t('spaces.detail.tasks.topic')"
              chips
              multiple
              v-bind="topicsProps"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 实名信息需求配置 -->
    <v-card flat rounded="lg" class="mb-3 form-card">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
              <v-icon color="primary" size="28">mdi-shield-account</v-icon>
            </v-avatar>
          </div>
        </template>
        <v-card-title class="text-h5 ps-0">实名信息要求</v-card-title>
      </v-card-item>

      <v-card-text class="pt-2">
        <v-switch v-model="requireRealName" color="primary" hide-details v-bind="requireRealNameProps">
          <template #label>
            <div class="d-flex align-center">
              <v-icon
                :icon="requireRealName ? 'mdi-account-check' : 'mdi-account-outline'"
                :color="requireRealName ? 'primary' : 'medium-emphasis'"
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
          v-if="requireRealName"
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
      </v-card-text>
    </v-card>

    <!-- 赛题详情 -->
    <v-card flat rounded="lg" class="mb-4 form-card">
      <v-card-item>
        <template #prepend>
          <div class="me-3">
            <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
              <v-icon color="primary" size="28">mdi-text-box-outline</v-icon>
            </v-avatar>
          </div>
        </template>
        <v-card-title class="text-h5 ps-0">{{ t('tasks.form.taskDescription') }}</v-card-title>
      </v-card-item>

      <v-card-text class="pt-2">
        <TipTapEditor
          ref="descriptionEditor"
          v-model="description"
          output="json"
          rounded
          :min-height="200"
          :max-height="1000"
          editor-class="tiptap-editor"
        />
      </v-card-text>
    </v-card>

    <div class="d-flex justify-end">
      <v-btn type="submit" color="primary" size="large" :loading="isSubmitting">{{ submitButtonText }}</v-btn>
    </div>

    <!-- 隐私政策确认弹窗 -->
    <v-dialog v-model="privacyDialogOpen" max-width="600" persistent scrollable>
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
          <v-alert type="info" variant="tonal" class="privacy-rights-alert mb-3" border="start" density="comfortable">
            <div class="text-subtitle-2 font-weight-medium mb-1">合规承诺</div>
            <p class="text-body-2 mb-0">
              作为赛题发布者，您应当严格遵守隐私保护规范，只有在必要的场景下才能查看参与者的实名信息。
              平台会记录每次查看行为，并对滥用行为采取相应处罚。
            </p>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="text" @click="cancelSubmitWithRealName">取消</v-btn>
          <v-btn color="primary" variant="flat" @click="confirmSubmitWithRealName">了解并接受</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script setup lang="ts">
import type { TaskFormSubmitData, Topic } from '@/types'
import type { SpaceCategory } from '@/types'

import { computed, defineEmits, defineProps, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { truncateString, vuetifyConfig } from '@/utils/form'

import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'

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
    categories?: SpaceCategory[]
    selectedCategoryId?: number
  }>(),
  {
    initialData: null,
    submitButtonText: '提交',
    isEditing: false,
    classificationTopics: () => [],
    categories: () => [],
    selectedCategoryId: undefined,
  }
)

const { classificationTopics, categories } = toRefs(props)

const topicItems = computed(() => classificationTopics.value.map((topic) => ({ title: topic.name, value: topic.id })))
const categoryItems = computed(() => categories.value.map((category) => ({ title: category.name, value: category.id })))

const emit = defineEmits<{
  submit: [data: TaskFormSubmitData]
}>()

const { t } = useI18n()

const taskForm = ref(null)
const descriptionEditor = ref<InstanceType<typeof TipTapEditor> | null>(null)

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z
      .object({
        name: z.string().min(1).max(100),
        submitterType: z.enum(['USER', 'TEAM']),
        deadline: z.date(),
        defaultDeadline: z.number().int().default(30),
        rank: z.number().int().min(1).max(3),
        topics: z.array(z.number()).optional(),
        categoryId: z.number().optional().nullable(),
        minTeamSize: z.number().int().min(1).optional(),
        maxTeamSize: z.number().int().min(1).optional(),
        requireRealName: z.boolean().optional().default(false),
        participantLimit: z.number().int().min(1).optional().nullable(),
        teamLockingPolicy: z.enum(['NO_LOCK', 'LOCK_ON_APPROVAL']).optional(),
      })
      .refine((arg) => !arg.maxTeamSize || !arg.minTeamSize || arg.maxTeamSize >= arg.minTeamSize, {
        message: '最大人数不能小于最小人数',
        path: ['maxTeamSize'],
      })
  ),
  initialValues: {
    ...(props.initialData ?? {}),
    deadline: props.initialData?.deadline
      ? new Date(props.initialData.deadline)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    requireRealName: props.initialData?.requireRealName ?? false,
    minTeamSize: props.initialData?.minTeamSize ?? 1,
    maxTeamSize: props.initialData?.maxTeamSize ?? 10,
    defaultDeadline: props.initialData?.defaultDeadline ?? 30,
    participantLimit: props.initialData?.participantLimit ?? null,
    teamLockingPolicy: props.initialData?.teamLockingPolicy ?? 'NO_LOCK',
  },
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [submitterType, submitterTypeProps] = defineField('submitterType', vuetifyConfig)
const [rank, rankProps] = defineField('rank', vuetifyConfig)
const [deadline, deadlineProps] = defineField('deadline', vuetifyConfig)
const [defaultDeadline, defaultDeadlineProps] = defineField('defaultDeadline', vuetifyConfig)
const [topics, topicsProps] = defineField('topics', vuetifyConfig)
const [minTeamSize, minTeamSizeProps] = defineField('minTeamSize', vuetifyConfig)
const [maxTeamSize, maxTeamSizeProps] = defineField('maxTeamSize', vuetifyConfig)
const [categoryId, categoryIdProps] = defineField('categoryId', vuetifyConfig)
const [requireRealName, requireRealNameProps] = defineField('requireRealName', vuetifyConfig)
const [participantLimit, participantLimitProps] = defineField('participantLimit', vuetifyConfig)
const [teamLockingPolicy, teamLockingPolicyProps] = defineField('teamLockingPolicy', vuetifyConfig)

const description = ref(props.initialData?.description || [])

const pendingSubmissionData = ref<{ descriptionText: string | undefined; values: any } | null>(null)

const submitForm = handleSubmit((values) => {
  if (requireRealName.value && !wasRealNameEnabled.value) {
    privacyDialogOpen.value = true
    pendingSubmissionData.value = {
      descriptionText: descriptionEditor.value?.editor?.getText(),
      values,
    }
    return
  }
  submitFormData(values)
})

const submitFormData = (values: any) => {
  const descriptionText = pendingSubmissionData.value?.descriptionText ?? descriptionEditor.value?.editor?.getText()
  const deadlineDate = new Date(values.deadline)
  deadlineDate.setHours(23, 59, 59, 999)
  const submissionData: TaskFormSubmitData = {
    ...values,
    description: JSON.stringify(description.value),
    intro: truncateString(descriptionText || '', 255),
    deadline: deadlineDate.getTime(),
    resubmittable: true,
    editable: true,
    requireRealName: requireRealName.value,
    categoryId: categoryId.value || undefined,
    minTeamSize: submitterType.value === 'TEAM' ? minTeamSize.value : undefined,
    maxTeamSize: submitterType.value === 'TEAM' ? maxTeamSize.value : undefined,
    participantLimit: participantLimit.value || undefined,
    teamLockingPolicy: submitterType.value === 'TEAM' ? teamLockingPolicy.value : undefined,
  }
  emit('submit', submissionData)
}

const privacyDialogOpen = ref(false)
const wasRealNameEnabled = ref(false)

const cancelSubmitWithRealName = () => {
  requireRealName.value = false
  wasRealNameEnabled.value = false
  privacyDialogOpen.value = false
  pendingSubmissionData.value = null
}

const confirmSubmitWithRealName = () => {
  wasRealNameEnabled.value = true
  privacyDialogOpen.value = false
  if (pendingSubmissionData.value) {
    submitFormData(pendingSubmissionData.value.values)
    pendingSubmissionData.value = null
  }
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
  margin-top: 0;
}

.form-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.form-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.15);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.05);
}

.v-card-text {
  padding-top: 12px;
  padding-bottom: 16px;
}

.mb-4 {
  margin-bottom: 12px !important;
}

.mb-3 {
  margin-bottom: 12px !important;
}

.mt-3 {
  margin-top: 12px !important;
}

.mt-4 {
  margin-top: 12px !important;
}
</style>
