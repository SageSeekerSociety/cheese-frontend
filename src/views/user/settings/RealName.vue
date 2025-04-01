<template>
  <v-card title="实名信息" rounded="lg">
    <template #title>
      <div class="d-flex align-center">
        <span>实名信息</span>
        <v-chip
          class="ml-3"
          size="small"
          color="primary"
          variant="outlined"
          :disabled="loadingPrecise"
          style="cursor: pointer"
          @click="fetchPreciseInfo"
        >
          <v-icon
            v-if="!loadingPrecise"
            start
            :icon="showingPrecise ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
            size="small"
          ></v-icon>
          <v-progress-circular
            v-else
            indeterminate
            size="16"
            width="2"
            color="primary"
            class="mr-2"
          ></v-progress-circular>
          {{ showingPrecise ? '已显示完整信息' : '姓名和学号已模糊处理' }}
        </v-chip>
      </div>
    </template>
    <template #text>
      <v-container>
        <!-- 简洁隐私提示横条 -->
        <v-card
          class="mb-6 privacy-banner"
          variant="flat"
          rounded="lg"
          color="grey-lighten-5"
          elevation="0"
          @click="showPrivacyDialog = true"
        >
          <v-card-text class="py-3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-shield-lock-outline" color="primary" size="20" class="me-2"></v-icon>
              <span class="text-body-2"
                >某些赛题需要实名信息用于验证身份，您的信息将<strong>安全加密</strong>，平台活动<strong
                  >完全匿名</strong
                ></span
              >
              <v-spacer></v-spacer>
              <span class="flex-shrink-0 ps-4 text-caption text-primary d-flex align-center">
                查看隐私说明
                <v-icon icon="mdi-chevron-right" size="small" class="ms-1"></v-icon>
              </span>
            </div>
          </v-card-text>
        </v-card>

        <v-form @submit.prevent="onSubmit">
          <!-- 基本信息部分 -->
          <div class="form-section">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-account-details-outline" color="primary" class="me-2"></v-icon>
              <h3 class="text-subtitle-1 font-weight-medium mb-0">基本信息</h3>
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="selectedRealName"
                  label="真实姓名"
                  placeholder="请输入您的真实姓名"
                  v-bind="realNameProps"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-account"
                  class="fuzzy-field"
                  @click="onFieldFocus('realName')"
                  @blur="onFieldBlur('realName')"
                >
                  <template v-if="isRealNameEdited" #append-inner>
                    <v-icon
                      color="primary"
                      icon="mdi-refresh"
                      size="small"
                      title="恢复原值"
                      class="reset-icon"
                      @click.stop="resetField('realName')"
                    ></v-icon>
                  </template>
                </v-text-field>
                <div v-if="hasRealNameInfo" class="text-caption mt-1 ms-2">
                  <span v-if="!isRealNameEdited && !showingPrecise" class="text-grey">点击输入框编辑信息</span>
                  <span v-else-if="showingPrecise" class="text-primary">已显示完整信息</span>
                  <span v-else class="text-primary">已编辑，可点击恢复按钮还原</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="selectedStudentId"
                  label="学号"
                  placeholder="请输入您的学号"
                  v-bind="studentIdProps"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-card-account-details-outline"
                  class="fuzzy-field"
                  @click="onFieldFocus('studentId')"
                  @blur="onFieldBlur('studentId')"
                >
                  <template v-if="isStudentIdEdited" #append-inner>
                    <v-icon
                      color="primary"
                      icon="mdi-refresh"
                      size="small"
                      title="恢复原值"
                      class="reset-icon"
                      @click.stop="resetField('studentId')"
                    ></v-icon>
                  </template>
                </v-text-field>
                <div v-if="hasRealNameInfo" class="text-caption mt-1 ms-2">
                  <span v-if="!isStudentIdEdited && !showingPrecise" class="text-grey">点击输入框编辑信息</span>
                  <span v-else-if="showingPrecise" class="text-primary">已显示完整信息</span>
                  <span v-else class="text-primary">已编辑，可点击恢复按钮还原</span>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- 学业信息部分 -->
          <div class="form-section">
            <div class="d-flex align-center mb-4">
              <v-icon icon="mdi-school-outline" color="primary" class="me-2"></v-icon>
              <h3 class="text-subtitle-1 font-weight-medium mb-0">学业信息</h3>
            </div>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="selectedGrade"
                  label="年级"
                  placeholder="例如：2023级"
                  v-bind="gradeProps"
                  variant="outlined"
                  prepend-inner-icon="mdi-school"
                  hint="填写您的入学年份，如2023级"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="selectedMajor"
                  label="专业"
                  placeholder="请输入您的专业"
                  v-bind="majorProps"
                  variant="outlined"
                  prepend-inner-icon="mdi-book-education"
                  hint="填写您的专业名称"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="selectedClassName"
                  label="班级"
                  placeholder="请输入您的班级"
                  v-bind="classNameProps"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-group"
                  hint="填写您所在的班级"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <div class="usage-note mt-6 mb-4">
            <div class="usage-note-content">
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-information-outline" color="primary" size="20" class="me-2"></v-icon>
                <h3 class="text-subtitle-2 font-weight-medium mb-0">实名信息的使用场景</h3>
              </div>
              <p class="text-body-2 mb-0">您的实名信息仅用于：</p>
              <div class="d-flex flex-wrap mt-1 usage-tags">
                <span class="usage-tag">身份验证</span>
                <span class="usage-tag">参与资格筛选</span>
                <span class="usage-tag">项目结题认证</span>
                <span class="usage-tag">评奖评优</span>
                <span class="usage-tag">学分认定</span>
              </div>
            </div>
          </div>

          <v-row>
            <v-col class="d-flex justify-end gap-4">
              <v-btn variant="outlined" @click="handleReset">重置</v-btn>
              <v-btn color="primary" type="submit" :loading="submitting">保存信息</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </template>
  </v-card>

  <!-- 隐私保护详情对话框 -->
  <v-dialog v-model="showPrivacyDialog" max-width="600">
    <v-card class="privacy-dialog" rounded="lg">
      <v-card-text class="pt-6">
        <div class="d-flex align-start mb-5">
          <v-icon icon="mdi-shield-lock-outline" color="primary" size="28" class="me-3 mt-1"></v-icon>
          <div>
            <h3 class="text-h5 font-weight-medium mb-1">实名信息保护说明</h3>
            <p class="text-body-2 text-medium-emphasis">我们如何保护您的信息安全并确保平台体验的匿名性</p>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" density="compact" @click="showPrivacyDialog = false"></v-btn>
        </div>

        <v-container class="px-0">
          <!-- 为什么需要实名信息 -->
          <div class="mb-4">
            <h3 class="text-subtitle-1 font-weight-medium mb-2">为什么需要填写实名信息？</h3>
            <p class="text-body-2">
              某些赛题需要收集实名信息用于身份验证、评审和颁奖等环节。我们仅收集必要的学校相关信息，并确保您在平台上的活动保持匿名性。
            </p>
          </div>

          <v-row>
            <v-col cols="12" sm="6">
              <div class="privacy-feature-card">
                <v-icon icon="mdi-incognito" color="primary" size="24" class="mb-2"></v-icon>
                <h3 class="text-subtitle-1 font-weight-medium mb-1">匿名参与</h3>
                <p class="text-body-2">平台上的日常活动保持匿名，其他用户无法看到您的真实身份信息</p>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="privacy-feature-card">
                <v-icon icon="mdi-key-variant" color="primary" size="24" class="mb-2"></v-icon>
                <h3 class="text-subtitle-1 font-weight-medium mb-1">加密存储</h3>
                <p class="text-body-2">使用行业标准的加密技术保护您的个人资料，防止未授权访问</p>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="privacy-feature-card">
                <v-icon icon="mdi-file-document-outline" color="primary" size="24" class="mb-2"></v-icon>
                <h3 class="text-subtitle-1 font-weight-medium mb-1">用途限制</h3>
                <p class="text-body-2">您的实名信息仅在必要的赛题报名环节使用，不用于其他目的</p>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="privacy-feature-card">
                <v-icon icon="mdi-eye-off-outline" color="primary" size="24" class="mb-2"></v-icon>
                <h3 class="text-subtitle-1 font-weight-medium mb-1">身份隔离</h3>
                <p class="text-body-2">严格隔离您的实名信息与平台账号，确保两者无法被关联</p>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex align-start">
            <v-icon icon="mdi-information-outline" color="primary" size="20" class="me-2 mt-1"></v-icon>
            <p class="text-body-2">
              我们的系统采用多层保护机制，在满足少数赛题对实名信息的需求的同时，确保您在平台上的隐私安全。
              所有对您信息的访问都会被记录，您可以随时查看这些记录。
            </p>
          </div>
        </v-container>
      </v-card-text>

      <v-card-actions class="pb-5 px-6">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" @click="showPrivacyDialog = false"> 明白了 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { RealNameInfo } from '@/network/api/users/types'

import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'
import { withSudo } from '@/utils/sudo'

import { UserApi } from '@/network/api/users'
import { ServerError } from '@/network/types/error'
import { currentUserId } from '@/services/account'

const router = useRouter()
const loading = ref(false)
const loadingPrecise = ref(false)
const showingPrecise = ref(false)
const submitting = ref(false)
const showPrivacyDialog = ref(false)
const realNameInfo = ref<RealNameInfo>({
  realName: '',
  studentId: '',
  grade: '',
  major: '',
  className: '',
  phone: '',
  email: '',
})
const hasRealNameInfo = ref(false)
const isRealNameEdited = ref(false)
const isStudentIdEdited = ref(false)
const originalRealName = ref('')
const originalStudentId = ref('')

const {
  handleSubmit,
  defineField,
  handleReset: resetFormToInitial,
  resetForm,
  setFieldValue,
} = useForm({
  validationSchema: toTypedSchema(
    z.object({
      realName: z.string().min(2, { message: '请输入至少2个字符的真实姓名' }),
      studentId: z.string().min(5, { message: '请输入有效的学号' }),
      grade: z.string().min(2, { message: '请输入有效的年级' }),
      major: z.string().min(2, { message: '请输入有效的专业' }),
      className: z.string().min(2, { message: '请输入有效的班级' }),
    })
  ),
})

const [selectedRealName, realNameProps] = defineField('realName', vuetifyConfig)
const [selectedStudentId, studentIdProps] = defineField('studentId', vuetifyConfig)
const [selectedGrade, gradeProps] = defineField('grade', vuetifyConfig)
const [selectedMajor, majorProps] = defineField('major', vuetifyConfig)
const [selectedClassName, classNameProps] = defineField('className', vuetifyConfig)

watch(selectedRealName, (newValue) => {
  isRealNameEdited.value = newValue !== originalRealName.value
})

watch(selectedStudentId, (newValue) => {
  isStudentIdEdited.value = newValue !== originalStudentId.value
})

const clearField = (fieldName: 'realName' | 'studentId') => {
  if (showingPrecise.value) return

  if (fieldName === 'realName') {
    if (!isRealNameEdited.value) {
      setFieldValue('realName', '')
      isRealNameEdited.value = true
    }
  } else {
    if (!isStudentIdEdited.value) {
      setFieldValue('studentId', '')
      isStudentIdEdited.value = true
    }
  }
}

const onFieldFocus = (fieldName: 'realName' | 'studentId') => {
  if (hasRealNameInfo.value) {
    clearField(fieldName)
  }
}

const onFieldBlur = (fieldName: 'realName' | 'studentId') => {
  if (fieldName === 'realName') {
    if (selectedRealName.value === '') {
      setFieldValue('realName', originalRealName.value)
      isRealNameEdited.value = false
    } else if (selectedRealName.value === originalRealName.value) {
      isRealNameEdited.value = false
    }
  } else {
    if (selectedStudentId.value === '') {
      setFieldValue('studentId', originalStudentId.value)
      isStudentIdEdited.value = false
    } else if (selectedStudentId.value === originalStudentId.value) {
      isStudentIdEdited.value = false
    }
  }
}

const resetField = (fieldName: 'realName' | 'studentId') => {
  if (fieldName === 'realName') {
    setFieldValue('realName', originalRealName.value)
    isRealNameEdited.value = false
  } else {
    setFieldValue('studentId', originalStudentId.value)
    isStudentIdEdited.value = false
  }
}

const fetchRealNameInfo = async () => {
  if (!currentUserId.value) return

  loading.value = true
  try {
    const { data } = await UserApi.getRealNameInfo(currentUserId.value, false)
    hasRealNameInfo.value = data.hasIdentity
    if (data.hasIdentity && data.identity) {
      realNameInfo.value = data.identity

      originalRealName.value = data.identity.realName
      originalStudentId.value = data.identity.studentId
      isRealNameEdited.value = false
      isStudentIdEdited.value = false
      showingPrecise.value = false

      resetForm({
        values: {
          realName: data.identity.realName,
          studentId: data.identity.studentId,
          grade: data.identity.grade,
          major: data.identity.major,
          className: data.identity.className,
        },
      })
    }
  } catch (error: any) {
    console.error('获取实名信息失败', error)
    toast.error(error.message || '获取实名信息失败')
  } finally {
    loading.value = false
  }
}

const fetchPreciseInfo = async () => {
  if (!currentUserId.value || !hasRealNameInfo.value || loadingPrecise.value || showingPrecise.value) return

  loadingPrecise.value = true
  showingPrecise.value = true

  try {
    const result = await withSudo(
      async () => {
        return await UserApi.getRealNameInfo(currentUserId.value!, true)
      },
      'viewRealNameInfo',
      null,
      router
    )

    if (result.data.hasIdentity && result.data.identity) {
      setFieldValue('realName', result.data.identity.realName)
      setFieldValue('studentId', result.data.identity.studentId)

      originalRealName.value = result.data.identity.realName
      originalStudentId.value = result.data.identity.studentId

      isRealNameEdited.value = false
      isStudentIdEdited.value = false

      toast.success('已加载完整实名信息')
    } else {
      toast.error('未填写过实名信息')
    }
  } catch (error: any) {
    console.error('获取精确实名信息失败', error)
    toast.error(error?.message || '获取完整实名信息失败，请重试')
    showingPrecise.value = false
  } finally {
    loadingPrecise.value = false
  }
}

// 提交表单
const onSubmit = handleSubmit(async (values) => {
  if (!currentUserId.value) return

  submitting.value = true
  try {
    await withSudo(
      async () => {
        const changedFields: Partial<RealNameInfo> = {}

        if (isRealNameEdited.value && values.realName !== originalRealName.value) {
          changedFields.realName = values.realName
        }

        if (isStudentIdEdited.value && values.studentId !== originalStudentId.value) {
          changedFields.studentId = values.studentId
        }

        if (values.grade !== realNameInfo.value.grade) changedFields.grade = values.grade
        if (values.major !== realNameInfo.value.major) changedFields.major = values.major
        if (values.className !== realNameInfo.value.className) changedFields.className = values.className

        if (Object.keys(changedFields).length === 0) {
          toast.info('未检测到任何修改')
          submitting.value = false
          return
        }

        console.log('提交的修改字段:', changedFields)

        const { data } = await UserApi.patchRealNameInfo(currentUserId.value!, changedFields)

        const wasPrecise = showingPrecise.value

        toast.success('实名信息保存成功')

        if (wasPrecise) {
          await fetchPreciseInfo()
        } else {
          await fetchRealNameInfo()
        }
      },
      'updateRealNameInfo',
      null,
      router
    )
  } catch (error: any) {
    console.error('保存实名信息失败', error)
    toast.error(error.message || '保存实名信息失败')
  } finally {
    submitting.value = false
  }
})

// 实现自定义的重置处理函数
const handleReset = () => {
  // 如果当前正在显示精确信息，需要保持精确状态
  if (showingPrecise.value) {
    // 重新获取精确信息以保持精确状态
    fetchPreciseInfo()
  } else {
    // 否则使用常规重置，重新加载模糊信息
    resetFormToInitial()
    fetchRealNameInfo()
  }
}

onMounted(() => {
  fetchRealNameInfo()
})
</script>

<style scoped lang="scss">
.v-card.highlighted {
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.privacy-banner {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  background: linear-gradient(to right, rgba(var(--v-theme-primary), 0.02), rgba(var(--v-theme-primary), 0.04));
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: linear-gradient(to right, rgba(var(--v-theme-primary), 0.04), rgba(var(--v-theme-primary), 0.06));
    border-color: rgba(var(--v-theme-primary), 0.12);
  }
}

.privacy-dialog {
  .privacy-feature-card {
    height: 100%;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid rgba(var(--v-theme-primary), 0.08);
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.02), rgba(var(--v-theme-primary), 0.04));
  }
}

.form-section {
  padding: 0 4px;
}

.usage-note {
  position: relative;
  border-radius: 8px;
  overflow: hidden;

  .usage-note-content {
    padding: 16px 20px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.03), rgba(var(--v-theme-primary), 0.07));
    border: 1px solid rgba(var(--v-theme-primary), 0.1);
  }

  .usage-tags {
    margin-top: 8px;
    gap: 8px;
    display: flex;
    flex-wrap: wrap;
  }

  .usage-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.08);
    white-space: nowrap;
  }
}

// 可点击编辑的输入框样式
.v-text-field {
  &:has(input:not(:focus)) {
    cursor: pointer;
  }

  &:deep() {
    .v-field--focused .v-field__outline {
      border-color: rgba(var(--v-theme-primary), 0.8) !important;
    }
  }
}

// 重置图标样式
.reset-icon {
  opacity: 0.7;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 4px;

  &:hover {
    opacity: 1;
    transform: rotate(-15deg);
  }
}

.fuzzy-field {
  position: relative;
}

// 精确信息徽章的样式
.v-chip {
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(var(--v-theme-primary), 0.1);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

// 编辑指示器动画
@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.text-primary {
  animation: pulse 2s infinite ease-in-out;
}
</style>
