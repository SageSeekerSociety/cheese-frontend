<template>
  <div>
    <v-banner v-if="hasSavedInfo" class="mb-4" lines="one">
      <template #text>
        <div class="d-flex align-center justify-space-between">
          <span>检测到您之前保存的信息，是否填入？</span>
        </div>
      </template>
      <template #actions>
        <v-btn @click="hasSavedInfo = false">忽略</v-btn>
        <v-btn append-icon="mdi-lightning-bolt" @click="fillSavedInfo"> 一键填入 </v-btn>
      </template>
    </v-banner>

    <v-form ref="verifyForm" @submit.prevent="submitForm">
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-text-field v-model="formData.realName" label="真实姓名" required v-bind="realNameProps"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field v-model="formData.studentId" label="学号" required v-bind="studentIdProps"></v-text-field>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-select v-model="formData.grade" label="年级" required v-bind="gradeProps" :items="gradeItems"></v-select>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field v-model="formData.className" label="班级" required v-bind="classNameProps"></v-text-field>
        </v-col>
      </v-row>

      <div class="contact-section">
        <div class="d-flex align-center mb-2">
          <span class="text-subtitle-2">联系方式</span>
          <v-chip class="ms-2" size="small" color="primary" variant="tonal">至少填写一项</v-chip>
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
        label="申请理由（选填）"
        v-bind="applyReasonProps"
        hint="请简要说明参与赛题的目的和期望"
        rows="3"
        auto-grow
      ></v-textarea>

      <div class="d-flex align-center">
        <v-checkbox
          v-model="saveToLocal"
          label="保存信息到本地，下次自动填写"
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
            为方便您下次填写，可选择将信息保存在浏览器本地。<br />
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

import { TaskParticipantRealNameInfo } from '@/types'

const STORAGE_KEY = 'verify_info_form_data'

const emit = defineEmits<{
  submit: [data: VerifyInfoFormData]
}>()

type VerifyInfoFormData = Omit<TaskParticipantRealNameInfo, 'major' | 'personalAdvantage' | 'remark'>

// 生成最近4个年级选项
const currentYear = new Date().getFullYear()
const gradeItems = Array.from({ length: 4 }, (_, i) => ({
  title: `${currentYear - i}级`,
  value: `${currentYear - i}`,
}))

const phoneRegex = /^1[3-9]\d{9}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const { handleSubmit, defineField, isSubmitting, setFieldValue } = useForm({
  validationSchema: toTypedSchema(
    z
      .object({
        realName: z.string().min(2, '姓名至少2个字符').max(20, '姓名最多20个字符'),
        studentId: z.string().min(5, '学号格式不正确').max(20, '学号格式不正确'),
        className: z.string().min(2, '班级至少2个字符').max(50, '班级最多50个字符'),
        grade: z.string().min(4, '请选择年级'),
        phone: z.string().regex(phoneRegex, '请输入正确的手机号').optional().or(z.literal('')),
        email: z.string().regex(emailRegex, '请输入正确的邮箱地址').optional().or(z.literal('')),
        applyReason: z.string().max(500, '理由最多500个字符').optional(),
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

const [realName, realNameProps] = defineField('realName', fieldConfig)
const [studentId, studentIdProps] = defineField('studentId', fieldConfig)
const [className, classNameProps] = defineField('className', fieldConfig)
const [grade, gradeProps] = defineField('grade', fieldConfig)
const [phone, phoneProps] = defineField('phone', fieldConfig)
const [email, emailProps] = defineField('email', fieldConfig)
const [applyReason, applyReasonProps] = defineField('applyReason', fieldConfig)

const formData = reactive({
  realName,
  studentId,
  className,
  grade,
  phone,
  email,
  applyReason,
})

const verifyForm = ref<HTMLFormElement | null>(null)
const saveToLocal = ref(false)
const hasSavedInfo = ref(false)

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
  emit('submit', values)
})

// 对外暴露提交方法
defineExpose({
  submit: () => verifyForm.value?.requestSubmit(),
  isSubmitting,
})
</script>

<style scoped>
.contact-section {
  margin-bottom: 16px;
}
</style>
