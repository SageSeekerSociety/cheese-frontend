<template>
  <v-container>
    <v-card outlined class="pa-4">
      <v-card-title class="text-h5 mb-4">
        <v-icon left class="mr-2">mdi-pencil</v-icon>
        编辑赛题
      </v-card-title>
      <v-divider class="mb-4"></v-divider>
      <LoadingErrorContainer v-if="loading || error" :loading="loading" :error="error" @retry="loadTaskData" />
      <TaskForm
        v-else-if="taskData"
        ref="taskFormRef"
        :initial-data="editTaskData"
        :submit-button-text="'保存更改'"
        is-editing
        :classification-topics="taskData.space?.classificationTopics || []"
        @submit="handleSubmitEdit"
        @cancel="navigateToDetail"
      >
        <template #buttons="{ isSubmitting }">
          <div class="d-flex gap-4">
            <v-btn variant="text" :disabled="isSubmitting || isResubmitting" @click="navigateToDetail">取消</v-btn>
            <v-btn color="primary" :loading="isSubmitting" type="submit">保存更改</v-btn>
            <v-btn
              v-if="showResubmitButton"
              color="success"
              :loading="isResubmitting"
              :disabled="isSubmitting"
              type="button"
              @click="submitWithReapproval"
            >
              保存并提交审核
            </v-btn>
          </div>
        </template>
      </TaskForm>

      <!-- 提交审核成功提示 -->
      <v-snackbar v-model="showResubmitSuccess" color="success" :timeout="3000">
        重新提交审核成功，等待管理员审核
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { LoadingErrorContainer } from './components'
import { useTaskData, useTaskManagement } from './composables'

import TaskForm from '@/components/tasks/TaskForm.vue'
import { TasksApi } from '@/network/api/tasks'

// Router
const router = useRouter()
const route = useRoute()
const taskId = Number(route.params.taskId)

// Composables
const taskDataModule = useTaskData()
const { taskData, editTaskData, loading, error, loadTaskData } = taskDataModule

const taskManagementModule = useTaskManagement(taskDataModule)
const { submitEditTask } = taskManagementModule

// 状态
const isResubmitting = ref(false)
const showResubmitSuccess = ref(false)
const taskFormRef = ref<InstanceType<typeof TaskForm> | null>(null)

// 显示重新提交审核按钮的条件
const showResubmitButton = computed(() => {
  return taskData.value?.approved === 'DISAPPROVED'
})

// Methods
const handleSubmitEdit = async (updatedTaskData: any) => {
  if (isResubmitting.value) {
    await handleSubmitWithReapproval(updatedTaskData)
    return
  }

  await submitEditTask(updatedTaskData)
  navigateToDetail()
}

const submitWithReapproval = async () => {
  if (!taskFormRef.value) return
  isResubmitting.value = true
  const form = taskFormRef.value.$el as HTMLFormElement
  form.requestSubmit()
}

const handleSubmitWithReapproval = async (formData: any) => {
  try {
    await submitEditTask(formData)
    await TasksApi.resubmitTask(taskId)
    showResubmitSuccess.value = true

    setTimeout(() => {
      navigateToDetail()
    }, 1500)
  } catch (error) {
    console.error('重新提交审核失败:', error)
  } finally {
    isResubmitting.value = false
  }
}

const navigateToDetail = () => {
  router.push({ name: 'TasksDetail', params: { taskId: taskId } })
}

onMounted(() => {
  loadTaskData()
})
</script>

<style scoped>
/* Add any specific styles for the edit page if needed */
</style>
