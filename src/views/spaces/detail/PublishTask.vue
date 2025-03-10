<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="t('tasks.publish.title')" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">
          {{ t('tasks.publish.back') }}
        </v-btn>
      </template>
    </v-toolbar>
    <task-form
      v-if="loadedTemplate"
      class="ma-4 pb-4"
      :initial-data="initialTaskData"
      :submit-button-text="t('tasks.publish.submit')"
      :classification-topics="classificationTopics"
      @submit="submitTask"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import type { TaskFormSubmitData, TaskSubmissionSchemaEntry } from '@/types'

import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { storeToRefs } from 'pinia'

import { TasksApi } from '@/network/api/tasks'
import { useSpaceStore } from '@/store/space'

const TaskForm = defineAsyncComponent(() => import('@/components/tasks/TaskForm.vue'))

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const spaceStore = useSpaceStore()
const { currentSpaceId, templates, classificationTopics } = storeToRefs(spaceStore)

const loadedTemplate = ref(false)

const initialTaskData = ref({})

const goBack = () => {
  router.go(-1)
}

const taskSubmissionSchema = ref<TaskSubmissionSchemaEntry[]>([
  {
    prompt: '提交文件',
    type: 'FILE',
  },
])

// const addSchemaEntry = (type: TaskSubmissionEntryType) => {
//   taskSubmissionSchema.value.push({ prompt: '', type })
// }

// const removeSchemaEntry = (index: number) => {
//   taskSubmissionSchema.value.splice(index, 1)
// }

const submitTask = async (taskData: TaskFormSubmitData) => {
  const spaceId = currentSpaceId.value
  if (!spaceId) {
    console.error('Space ID not found')
    return
  }
  try {
    const {
      data: {
        task: { approved },
      },
    } = await TasksApi.create({ ...taskData, submissionSchema: taskSubmissionSchema.value, space: spaceId })
    if (!approved) {
      toast.success(t('spaces.detail.publishTask.createSuccessAndWaitingAudit'))
    } else {
      toast.success(t('spaces.detail.publishTask.createSuccess'))
    }
    router.replace({ name: 'SpacesDetailTasks', params: { spaceId }, query: { type: 'published' } })
  } catch (error) {
    console.error(t('spaces.detail.publishTask.createFailed'), error)
    toast.error(t('spaces.detail.publishTask.createFailed'))
  }
}

onMounted(async () => {
  const templateId = route.query.templateId
  if (templateId && templateId !== 'blank') {
    await loadTemplate(Number(templateId))
  }
  loadedTemplate.value = true
})

const loadTemplate = async (templateId: number) => {
  const template = templates.value[templateId]
  if (template) {
    initialTaskData.value = {
      name: template.title,
      description: JSON.parse(template.content),
    }
  }
}
</script>
