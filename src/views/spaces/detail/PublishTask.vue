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
      @submit="submitTask"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TasksApi } from '@/network/api/tasks'
import TaskForm from '@/components/tasks/TaskForm.vue'
import { useSpaceStore } from '@/store/space'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { TaskFormSubmitData, TaskSubmissionSchemaEntry } from '@/types'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const spaceStore = useSpaceStore()
const { currentSpaceId, templates } = storeToRefs(spaceStore)

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
    await TasksApi.create({ ...taskData, submissionSchema: taskSubmissionSchema.value, space: spaceId })
    router.replace({ name: 'SpacesDetailTasks', params: { spaceId } })
  } catch (error) {
    console.error(t('tasks.publish.createFailed'), error)
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
