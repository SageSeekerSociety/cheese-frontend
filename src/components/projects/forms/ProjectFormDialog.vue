<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="px-4 pt-4 pb-2">
        <span class="text-h6">
          {{ getDialogTitle() }}
        </span>
      </v-card-title>
      <v-card-text class="px-4">
        <project-form
          ref="formRef"
          :initial-data="initialData"
          :is-subproject="isSubproject"
          :team-members="teamMembers"
          :team-id="teamId"
          :parent-id="parentId"
          @submit="handleSubmit"
          @cancel="$emit('update:modelValue', false)"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="loading" @click="$emit('update:modelValue', false)">取消</v-btn>
        <v-btn color="primary" :loading="loading" @click="triggerSubmit">
          {{ loading ? '保存中...' : isEditing ? '保存修改' : '创建' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Project, User } from '@/types'

import { computed, ref } from 'vue'

import ProjectForm from './ProjectForm.vue'

const props = defineProps<{
  modelValue: boolean
  initialData?: Partial<Project> | null
  isSubproject?: boolean
  isEditing?: boolean
  teamMembers?: User[]
  teamId?: number
  parentId?: number
  loading?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref<InstanceType<typeof ProjectForm> | null>(null)

// 获取对话框标题
const getDialogTitle = () => {
  if (props.isEditing) {
    return props.isSubproject ? '编辑子项目' : '编辑项目'
  }
  return props.isSubproject ? '创建子项目' : '创建项目'
}

// 触发表单提交
const triggerSubmit = () => {
  formRef.value?.submit()
}

// 处理表单提交
const handleSubmit = (formData: any) => {
  emit('submit', formData)
}
</script>

<style scoped>
/* 样式已在各自组件中定义 */
</style>
