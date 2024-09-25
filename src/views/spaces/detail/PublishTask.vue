<template>
  <v-sheet flat rounded="lg">
    <v-toolbar title="发布赛题" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">返回</v-btn>
      </template>
    </v-toolbar>
    <v-form class="pa-4" @submit.prevent="submitTask">
      <v-text-field v-model="taskData.name" label="任务名称" required></v-text-field>
      <v-radio-group v-model="taskData.submitterType" label="提交者类型" required inline>
        <v-radio label="用户" value="USER"></v-radio>
        <v-radio label="小队" value="TEAM"></v-radio>
      </v-radio-group>
      <v-text-field v-model="taskData.deadline" label="截止时间" type="datetime-local" required></v-text-field>
      <div class="d-flex align-center">
        <v-checkbox v-model="taskData.resubmittable" label="允许重新提交" color="primary"></v-checkbox>
        <v-checkbox v-model="taskData.editable" label="允许编辑" color="primary"></v-checkbox>
      </div>
      <v-textarea v-model="taskData.description" label="任务描述" required></v-textarea>
      <div v-for="(entry, index) in taskData.submissionSchema" :key="index" class="submission-schema-entry">
        <div class="d-flex align-center justify-between mb-2">
          <span class="text-subtitle-2 font-weight-medium text-medium-emphasis">
            <v-icon>{{ entry.type === 'TEXT' ? 'mdi-text' : 'mdi-file' }}</v-icon>
            提交项 #{{ index + 1 }}
          </span>
          <div class="flex-grow-1"></div>
          <v-btn icon size="small" density="compact" color="error" @click="removeSchemaEntry(index)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-text-field v-model="entry.prompt" label="提示" required></v-text-field>
      </div>

      <div class="d-flex justify-end publish-task-btn-group">
        <v-menu open-on-hover>
          <template #activator="{ props }">
            <v-btn v-bind="props">添加提交项</v-btn>
          </template>
          <v-list>
            <v-list-item @click="addSchemaEntry('TEXT')">
              <template #prepend>
                <v-icon>mdi-text</v-icon>
              </template>
              <v-list-item-title>文本</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addSchemaEntry('FILE')">
              <template #prepend>
                <v-icon>mdi-file</v-icon>
              </template>
              <v-list-item-title>文件</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn type="submit" color="primary">提交</v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TasksApi } from '@/network/api/tasks'
import { TaskSubmissionEntryType, TaskSubmissionSchemaEntry, TaskSubmitterType } from '@/types'

const router = useRouter()
const goBack = () => {
  router.go(-1)
}

const taskData = ref({
  name: '',
  submitterType: 'USER' as TaskSubmitterType,
  deadline: '',
  resubmittable: false,
  editable: false,
  description: '',
  submissionSchema: [] as TaskSubmissionSchemaEntry[],
})

const addSchemaEntry = (type: TaskSubmissionEntryType) => {
  taskData.value.submissionSchema.push({ prompt: '', type })
}

const removeSchemaEntry = (index: number) => {
  taskData.value.submissionSchema.splice(index, 1)
}

const submitTask = async () => {
  const spaceId = Number(router.currentRoute.value.params.spaceId)
  try {
    const postTaskData = {
      ...taskData.value,
      deadline: new Date(taskData.value.deadline).getTime(), // 将截止时间转换为时间戳
      space: spaceId,
    }
    await TasksApi.create(postTaskData)
    router.replace({ name: 'SpacesDetailTasks', params: { spaceId } })
  } catch (error) {
    console.error('创建任务失败:', error)
  }
}
</script>

<style scoped>
.publish-task-btn-group {
  gap: 16px;
}

.submission-schema-entry {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}
</style>
