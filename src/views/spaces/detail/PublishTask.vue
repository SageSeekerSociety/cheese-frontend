<template>
  <v-sheet flat rounded="lg">
    <v-toolbar title="发布赛题" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">返回</v-btn>
      </template>
    </v-toolbar>
    <v-form ref="taskForm" class="pa-4" @submit.prevent="submitTask">
      <v-text-field v-model="name" label="任务名称" required v-bind="nameProps"></v-text-field>
      <v-radio-group v-model="submitterType" label="提交者类型" required inline v-bind="submitterTypeProps">
        <v-radio label="用户" value="USER"></v-radio>
        <v-radio label="小队" value="TEAM"></v-radio>
      </v-radio-group>
      <v-radio-group v-model="rank" label="任务等级" required inline v-bind="rankProps">
        <v-radio label="初级" :value="1"></v-radio>
        <v-radio label="中级" :value="2"></v-radio>
        <v-radio label="高级" :value="3"></v-radio>
      </v-radio-group>
      <v-text-field
        v-model="deadline"
        label="截止时间"
        type="datetime-local"
        required
        v-bind="deadlineProps"
      ></v-text-field>
      <div class="d-flex align-center gap-4">
        <v-checkbox
          v-model="resubmittable"
          label="允许多次提交"
          color="primary"
          v-bind="resubmittableProps"
        ></v-checkbox>
        <v-checkbox v-model="editable" label="允许编辑" color="primary" v-bind="editableProps"></v-checkbox>
      </div>
      <TipTapEditor
        ref="descriptionEditor"
        v-model="taskDescription"
        output="json"
        rounded
        :min-height="200"
        :max-height="1000"
        editor-class="tiptap-editor"
        title="任务描述"
      />
      <div v-for="(entry, index) in taskSubmissionSchema" :key="index" class="submission-schema-entry mt-4 pa-4">
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

      <div class="d-flex justify-end publish-task-btn-group mt-4">
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
        <v-btn type="submit" color="primary" :loading="isSubmitting">提交</v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TasksApi } from '@/network/api/tasks'
import { SpacesApi } from '@/network/api/spaces'
import { TaskSubmissionEntryType, TaskSubmissionSchemaEntry, TaskSubmitterType, SpaceTaskTemplate } from '@/types'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { z } from 'zod'
import { vuetifyConfig } from '@/utils/form'
import { JSONContent } from 'vuetify-pro-tiptap'

const taskForm = ref<InstanceType<typeof VForm> | null>(null)

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z.string().max(25),
      submitterType: z.enum(['USER', 'TEAM']),
      rank: z.number().int().min(1).max(3),
      deadline: z.string(),
      resubmittable: z.boolean().optional().default(false),
      editable: z.boolean().optional().default(false),
    })
  ),
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [submitterType, submitterTypeProps] = defineField('submitterType', vuetifyConfig)
const [rank, rankProps] = defineField('rank', vuetifyConfig)
const [deadline, deadlineProps] = defineField('deadline', vuetifyConfig)
const [resubmittable, resubmittableProps] = defineField('resubmittable', vuetifyConfig)
const [editable, editableProps] = defineField('editable', vuetifyConfig)

const descriptionEditor = ref<InstanceType<typeof TipTapEditor> | null>(null)

const router = useRouter()
const route = useRoute()
const goBack = () => {
  router.go(-1)
}

const taskDescription = ref<JSONContent>({
  type: 'doc',
  content: [],
})
const taskSubmissionSchema = ref<TaskSubmissionSchemaEntry[]>([])

const addSchemaEntry = (type: TaskSubmissionEntryType) => {
  taskSubmissionSchema.value.push({ prompt: '', type })
}

const removeSchemaEntry = (index: number) => {
  taskSubmissionSchema.value.splice(index, 1)
}

const submitTask = handleSubmit(async (value) => {
  console.log(value)
  let intro = descriptionEditor.value?.editor?.getText() ?? ''
  if (intro.length > 250) {
    intro = intro.slice(0, 250) + '……'
  }
  const spaceId = Number(router.currentRoute.value.params.spaceId)
  try {
    const postTaskData = {
      ...value,
      description: JSON.stringify(taskDescription.value),
      intro,
      deadline: new Date(value.deadline).getTime(),
      rank: value.rank,
      space: spaceId,
      submissionSchema: taskSubmissionSchema.value,
    }
    await TasksApi.create(postTaskData)
    router.replace({ name: 'SpacesDetailTasks', params: { spaceId } })
  } catch (error) {
    console.error('创建任务失败:', error)
  }
})

onMounted(async () => {
  const templateId = route.query.templateId
  if (templateId && templateId !== 'blank') {
    await loadTemplate(Number(templateId))
  }
})

const loadTemplate = async (templateId: number) => {
  try {
    const response = await SpacesApi.detail(Number(route.params.spaceId))
    const taskTemplates = JSON.parse(response.data.space.taskTemplates || '[]')
    const template = taskTemplates[templateId] as SpaceTaskTemplate
    if (template) {
      name.value = template.title
      taskDescription.value = JSON.parse(template.content)
    }
  } catch (error) {
    console.error('加载模板失败:', error)
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
}
</style>
