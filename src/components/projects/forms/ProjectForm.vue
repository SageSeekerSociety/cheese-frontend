<template>
  <v-form ref="formRef" @submit.prevent="submit">
    <v-row dense>
      <!-- 项目名称 -->
      <v-col cols="12">
        <v-text-field
          v-model="name"
          label="项目名称"
          variant="outlined"
          density="comfortable"
          placeholder="请输入项目名称"
          v-bind="nameProps"
          maxlength="50"
        ></v-text-field>
      </v-col>

      <!-- 项目描述 -->
      <v-col cols="12">
        <v-textarea
          v-model="description"
          label="项目描述"
          variant="outlined"
          rows="3"
          auto-grow
          counter
          placeholder="请输入项目描述"
          v-bind="descriptionProps"
          maxlength="500"
        ></v-textarea>
      </v-col>

      <!-- 项目标签颜色 -->
      <v-col cols="12">
        <label class="text-subtitle-2 mb-2 d-block">
          {{ isSubproject ? '子项目' : '项目' }}标签颜色
          <span class="text-caption text-medium-emphasis">(用于快速区分)</span>
        </label>
        <color-selector v-model="modelColorCode" :label="''"></color-selector>
      </v-col>

      <!-- 时间范围 -->
      <v-col cols="12" md="6">
        <v-date-input
          v-model="startDate"
          label="开始日期"
          prepend-icon=""
          variant="outlined"
          v-bind="startDateProps"
        ></v-date-input>
      </v-col>

      <v-col cols="12" md="6">
        <v-date-input
          v-model="endDate"
          label="结束日期"
          prepend-icon=""
          variant="outlined"
          v-bind="endDateProps"
        ></v-date-input>
      </v-col>

      <!-- 负责人选择（如果提供了 teamMembers） -->
      <v-col v-if="teamMembers && teamMembers.length > 0" cols="12">
        <v-autocomplete
          v-model="leaderId"
          label="负责人"
          variant="outlined"
          density="comfortable"
          :items="teamMembers"
          item-title="nickname"
          item-value="id"
          return-object
          clearable
          v-bind="leaderIdProps"
        >
          <template #item="{ item, props }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-avatar size="32">
                  <v-img :src="getAvatarUrl(item.raw.avatarId)" />
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.raw.nickname }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import type { Project, User } from '@/types'

import { computed, ref } from 'vue'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { toTypedSchema } from '@vee-validate/zod'
import dayjs from 'dayjs'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'
import { getAvatarUrl } from '@/utils/materials'

import ColorSelector from '@/components/common/ColorSelector.vue'

const props = defineProps<{
  initialData?: Partial<Project> | null
  isSubproject?: boolean
  teamMembers?: User[]
  teamId?: number
  parentId?: number
}>()

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref<InstanceType<typeof VForm> | null>(null)

// 表单验证
const {
  handleSubmit,
  defineField,
  meta: formMeta,
  resetForm,
} = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z.string().max(50),
      description: z.string().max(500),
      colorCode: z.string(),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      leaderId: z.any().nullable(),
    })
  ),
  initialValues: {
    name: props.initialData?.name,
    description: props.initialData?.description,
    colorCode: props.initialData?.colorCode || '#6366f1',
    startDate: props.initialData?.startDate
      ? dayjs(props.initialData.startDate).toDate()
      : dayjs().startOf('day').toDate(),
    endDate: props.initialData?.endDate
      ? dayjs(props.initialData.endDate).toDate()
      : dayjs().add(7, 'day').endOf('day').toDate(),
    leaderId: props.initialData?.leader || null,
  },
})

// 定义表单字段
const [name, nameProps] = defineField('name', vuetifyConfig)
const [description, descriptionProps] = defineField('description', vuetifyConfig)
const [colorCode, colorCodeProps] = defineField('colorCode', vuetifyConfig)
const [startDate, startDateProps] = defineField('startDate', vuetifyConfig)
const [endDate, endDateProps] = defineField('endDate', vuetifyConfig)
const [leaderId, leaderIdProps] = defineField('leaderId', vuetifyConfig)

// 计算属性处理颜色代码，确保不为undefined
const modelColorCode = computed({
  get: () => colorCode.value || '#6366f1',
  set: (value) => {
    colorCode.value = value
  },
})

// 提交处理函数
const submit = handleSubmit((values) => {
  const formData = {
    name: values.name,
    description: values.description,
    colorCode: values.colorCode,
    startDate: values.startDate ? new Date(values.startDate).getTime() : Date.now(),
    endDate: values.endDate ? new Date(values.endDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
    teamId: props.teamId || props.initialData?.team?.id || 0,
    leaderId: values.leaderId?.id || props.initialData?.leader?.id || 0,
    parentId: props.isSubproject ? props.parentId || 0 : undefined,
  }

  emit('submit', formData)
})

// 暴露给父组件的方法
defineExpose({
  resetForm,
  submit,
  formMeta,
})
</script>
