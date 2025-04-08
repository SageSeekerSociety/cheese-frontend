<template>
  <div>
    <v-banner v-if="hasSavedInfo" class="mb-4" lines="one">
      <template #text>
        <div class="d-flex align-center justify-space-between">
          <span>检测到您之前保存的联系方式，是否填入？</span>
        </div>
      </template>
      <template #actions>
        <v-btn @click="hasSavedInfo = false">忽略</v-btn>
        <v-btn append-icon="mdi-lightning-bolt" @click="fillSavedInfo"> 一键填入 </v-btn>
      </template>
    </v-banner>

    <v-form ref="verifyForm" @submit.prevent="submitForm">
      <div class="contact-section">
        <div class="d-flex align-center mb-2">
          <span class="text-subtitle-2">联系方式</span>
          <v-chip class="ms-2" size="small" color="primary" variant="tonal">至少填写一项</v-chip>
          <v-tooltip v-if="requireRealName" location="top" max-width="300">
            <template #activator="{ props }">
              <v-icon v-bind="props" color="info" size="18" class="ms-2">mdi-information-outline</v-icon>
            </template>
            <span>此赛题要求实名参与，您的联系方式将用于身份验证和通知</span>
          </v-tooltip>
        </div>

        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formData.phone"
              label="手机号"
              :hint="!formData.email ? '请至少填写手机号或邮箱中的一项' : undefined"
              :required="!formData.email"
              prepend-inner-icon="mdi-phone"
              v-bind="phoneProps"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formData.email"
              label="邮箱"
              :hint="!formData.phone ? '请至少填写手机号或邮箱中的一项' : undefined"
              :required="!formData.phone"
              prepend-inner-icon="mdi-email"
              v-bind="emailProps"
            ></v-text-field>
          </v-col>
        </v-row>
      </div>

      <v-textarea
        v-model="formData.applyReason"
        label="申请理由"
        v-bind="applyReasonProps"
        hint="请简要说明参与赛题的目的和期望"
        rows="3"
        auto-grow
      ></v-textarea>

      <div class="d-flex align-center">
        <v-checkbox
          v-model="saveToLocal"
          label="保存联系方式到本地，下次自动填写"
          color="primary"
          hide-details
          density="compact"
        >
        </v-checkbox>
        <v-tooltip location="right">
          <template #activator="{ props }">
            <v-icon v-bind="props" color="primary" size="18" class="ms-2"> mdi-shield-check </v-icon>
          </template>
          <div class="text-body-2">
            为方便您下次填写，可选择将联系方式保存在浏览器本地。<br />
            这些信息仅存储在您的设备上，平台不会收集或保存。<br />
            申请理由不会被保存。
          </div>
        </v-tooltip>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'

import { useEvents } from '@/views/tasks/events'

defineProps<{
  requireRealName: boolean
}>()

const STORAGE_KEY = 'verify_info_form_data'

type VerifyInfoFormData = {
  phone?: string
  email?: string
  applyReason?: string
}

const emit = defineEmits<{
  (e: 'submit', formData: VerifyInfoFormData): void
}>()

const phoneRegex = /^1[3-9]\d{9}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const { handleSubmit, defineField, isSubmitting, setFieldValue } = useForm({
  validationSchema: toTypedSchema(
    z
      .object({
        phone: z.string().regex(phoneRegex, '请输入正确的手机号').optional().or(z.literal('')),
        email: z.string().regex(emailRegex, '请输入正确的邮箱地址').optional().or(z.literal('')),
        applyReason: z.string().max(500, '理由最多500个字符').optional().or(z.literal('')),
      })
      .refine((data) => data.phone || data.email, {
        message: '请至少填写手机号或邮箱中的一项',
        path: ['phone'], // 将错误消息显示在手机号字段
      })
  ),
})

// 修改 defineField 的配置
const fieldConfig = (state: { errors: any }) => ({
  ...vuetifyConfig(state),
  validateOnInput: false, // 输入时不验证
  validateOnChange: false, // 值变化时不验证
  validateOnBlur: true, // 失去焦点时验证
  validateOnModelUpdate: false, // 数据更新时不验证
})

const [phone, phoneProps] = defineField('phone', fieldConfig)
const [email, emailProps] = defineField('email', fieldConfig)
const [applyReason, applyReasonProps] = defineField('applyReason', fieldConfig)

const formData = reactive({
  phone,
  email,
  applyReason,
})

const verifyForm = ref<HTMLFormElement | null>(null)
const saveToLocal = ref(false)
const hasSavedInfo = ref(false)

// 使用事件总线
const events = useEvents()

// 检查本地存储
onMounted(() => {
  const savedData = localStorage.getItem(STORAGE_KEY)
  if (savedData) {
    hasSavedInfo.value = true
    // 如果有保存的信息，默认勾选保存选项
    saveToLocal.value = true
  }
})

// 填入保存的信息
const fillSavedInfo = () => {
  const savedData = localStorage.getItem(STORAGE_KEY)
  if (savedData) {
    const data = JSON.parse(savedData) as Partial<VerifyInfoFormData>
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'applyReason' && value) {
        setFieldValue(key as keyof VerifyInfoFormData, value)
      }
    })
    hasSavedInfo.value = false
  }
}

const submitForm = handleSubmit((values) => {
  if (saveToLocal.value) {
    // 保存除了申请理由之外的信息
    const dataToSave = { ...values }
    delete dataToSave.applyReason
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  }

  // 通过事件总线发送数据
  events.emit('verify-form-submit', values as any)
  // 通过props发送数据
  emit('submit', values as VerifyInfoFormData)
})

// 暴露方法供父组件调用
defineExpose({
  /**
   * 提交表单的方法
   */
  submit: () => {
    console.log('提交表单', verifyForm.value)
    if (verifyForm.value) {
      verifyForm.value.requestSubmit()
    } else {
      submitForm()
    }
  },
  isSubmitting,
})
</script>

<style scoped>
.contact-section {
  margin-bottom: 16px;
}
</style>
