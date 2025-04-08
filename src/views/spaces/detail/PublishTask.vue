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
      :categories="activeCategories"
      :selected-category-id="preselectedCategoryId"
      @submit="submitTask"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import type { TaskSubmissionSchemaEntry } from '@/types'
import type { TaskFormSubmitData } from '@/types'

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { storeToRefs } from 'pinia'

import { TasksApi } from '@/network/api/tasks'
import { useSpaceStore } from '@/stores/space'

const TaskForm = defineAsyncComponent(() => import('@/components/tasks/TaskForm.vue'))

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const spaceStore = useSpaceStore()
const { currentSpaceId, templates, classificationTopics, categories } = storeToRefs(spaceStore)

// 获取活跃的分类列表
const activeCategories = computed(() => {
  return categories.value.filter((category) => !category.archivedAt).sort((a, b) => a.displayOrder - b.displayOrder)
})

// 从URL参数中获取预选的分类ID
const preselectedCategoryId = computed(() => {
  const categoryParam = route.query.categoryId
  if (!categoryParam) return undefined

  const categoryId = Number(categoryParam)
  // 确保分类在活跃分类列表中
  return activeCategories.value.some((cat) => cat.id === categoryId) ? categoryId : undefined
})

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
    } = await TasksApi.create({
      ...taskData,
      submissionSchema: taskSubmissionSchema.value,
      space: spaceId,
      requireRealName: taskData.requireRealName || false,
      categoryId: taskData.categoryId,
    })
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
  await spaceStore.fetchCategories() // 加载分类列表

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
      submitterType: template.submitterType !== null ? template.submitterType : undefined,
      rank: template.rank !== null ? template.rank : undefined,
      minTeamSize: template.minTeamSize,
      maxTeamSize: template.maxTeamSize,
      defaultDeadline: template.defaultDeadline !== null ? template.defaultDeadline : undefined,
      requireRealName: template.requireRealName !== null ? template.requireRealName : undefined,
    }
  }
}
</script>
