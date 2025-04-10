<template>
  <v-form ref="formRef" @submit.prevent="submit">
    <v-row dense>
      <!-- 频道名称 -->
      <v-col cols="12">
        <v-text-field
          v-model="name"
          label="频道名称"
          variant="outlined"
          density="comfortable"
          placeholder="请输入频道名称"
          v-bind="nameProps"
          maxlength="50"
        ></v-text-field>
      </v-col>

      <!-- 频道标签颜色（基本选项） -->
      <v-col cols="12">
        <label class="text-subtitle-2 mb-2 d-block">
          频道颜色
          <span class="text-caption text-medium-emphasis">(用于快速区分)</span>
        </label>
        <color-selector v-model="modelColorCode" :label="''"></color-selector>
      </v-col>

      <!-- 高级选项 -->
      <v-col cols="12" class="mt-2">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel title="高级选项">
            <v-expansion-panel-text>
              <!-- 频道描述 -->
              <v-textarea
                v-model="description"
                label="频道描述"
                variant="outlined"
                rows="2"
                auto-grow
                counter
                placeholder="描述这个频道的用途..."
                v-bind="descriptionProps"
                maxlength="500"
                class="mb-4"
              ></v-textarea>

              <!-- 日期范围 -->
              <div class="d-flex">
                <v-date-input
                  v-model="startDate"
                  label="开始日期"
                  prepend-icon=""
                  variant="outlined"
                  density="comfortable"
                  v-bind="startDateProps"
                  class="me-3 flex-grow-1"
                ></v-date-input>

                <v-date-input
                  v-model="endDate"
                  label="结束日期"
                  prepend-icon=""
                  variant="outlined"
                  density="comfortable"
                  v-bind="endDateProps"
                  class="flex-grow-1"
                ></v-date-input>
              </div>

              <!-- 负责人选择（如果提供了 teamMembers） -->
              <div v-if="teamMembers && teamMembers.length > 0" class="mt-4">
                <v-autocomplete
                  v-model="leaderId"
                  label="频道负责人"
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
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import type { Project, User } from '@/types'

import { computed, onMounted, ref, watch } from 'vue'
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
  isEditing?: boolean
  teamMembers?: User[]
  teamId?: number
  parentId?: number
  parentChannels?: Project[]
}>()

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const selectedParentId = ref<number | null>(null)

onMounted(() => {
  console.log('ProjectForm mounted - setting parent ID:', props.parentId)
  selectedParentId.value = props.parentId || null
})

const {
  handleSubmit,
  defineField,
  meta: formMeta,
  resetForm,
} = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z.string().min(1, '频道名称不能为空').max(50),
      description: z.string().max(500).optional(),
      colorCode: z.string(),
      startDate: z.date().nullable().optional(),
      endDate: z.date().nullable().optional(),
      leaderId: z.any().nullable().optional(),
    })
  ),
  initialValues: {
    name: props.initialData?.name || '',
    description: props.initialData?.description || '',
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

// 监听父频道选择变化
watch(selectedParentId, (newVal) => {
  console.log('ProjectForm - selectedParentId changed:', newVal)
})

// 监听 props.parentId 变化
watch(
  () => props.parentId,
  (newVal) => {
    console.log('ProjectForm - props.parentId changed:', newVal)
    selectedParentId.value = newVal || null
  }
)

// 提交处理函数 - 可选字段使用默认值或空值提交
const submit = handleSubmit((values) => {
  const formData = {
    name: values.name,
    description: values.description || '',
    colorCode: values.colorCode,
    startDate: values.startDate ? new Date(values.startDate).getTime() : Date.now(),
    endDate: values.endDate ? new Date(values.endDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
    teamId: props.teamId || props.initialData?.team?.id || 0,
    leaderId: values.leaderId?.id || props.initialData?.leader?.id || 0,
    parentId: selectedParentId.value,
  }

  console.log('ProjectForm - submitting with parentId:', selectedParentId.value)
  emit('submit', formData)
})

// 暴露给父组件的方法
defineExpose({
  resetForm,
  submit,
  formMeta,
})
</script>

<style scoped>
.v-expansion-panel-title {
  min-height: 48px;
}
</style>
