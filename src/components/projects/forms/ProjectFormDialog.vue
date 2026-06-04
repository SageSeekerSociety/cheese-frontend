<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="lg" class="channel-dialog">
      <v-card-title class="px-4 pt-4 pb-2">
        <span class="text-h6">
          {{ getDialogTitle() }}
        </span>
        <div v-if="dialogSubtitle" class="text-subtitle-2 text-medium-emphasis mt-1">
          {{ dialogSubtitle }}
        </div>
      </v-card-title>
      <v-card-text class="px-4">
        <project-form
          ref="formRef"
          :initial-data="initialData"
          :is-subproject="isSubproject"
          :is-editing="isEditing"
          :team-members="teamMembers"
          :team-id="teamId"
          :parent-id="computedParentId"
          :parent-channels="availableParentChannels"
          @submit="handleSubmit"
          @cancel="$emit('update:modelValue', false)"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="loading" @click="$emit('update:modelValue', false)">取消</v-btn>
        <v-btn color="primary" :loading="loading" @click="triggerSubmit">
          {{ loading ? '保存中...' : isEditing ? '保存修改' : '创建频道' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Project, User } from '@/types'

import { computed, onMounted, ref } from 'vue'

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
  parentChannelId?: number | null
  availableParentChannels?: Project[]
  dialogSubtitle?: string
}>()

const computedParentId = computed<number | undefined>(() => {
  const parentId =
    props.parentChannelId !== undefined && props.parentChannelId !== null ? props.parentChannelId : props.parentId
  console.log('Dialog computedParentId:', parentId)
  return parentId
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref<InstanceType<typeof ProjectForm> | null>(null)

const getDialogTitle = () => {
  if (props.isEditing) {
    return '编辑频道'
  }
  return computedParentId.value ? '创建子频道' : '创建新频道'
}

const triggerSubmit = () => {
  formRef.value?.submit()
}

const handleSubmit = (formData: any) => {
  console.log('Dialog - 接收到表单数据，parentId =', formData.parentId)
  // 确保数据完整传递给上级组件
  emit('submit', {
    ...formData,
  })
}

onMounted(() => {
  console.log('Dialog - computed parentId:', computedParentId.value)
  console.log('Dialog - parentChannelId:', props.parentChannelId)
})
</script>

<style scoped>
.channel-dialog {
  overflow: visible;
}
</style>
