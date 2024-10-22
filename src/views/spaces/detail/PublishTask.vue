<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="t('spaces.detail.publishTask.title')" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">{{
          t('spaces.detail.publishTask.back')
        }}</v-btn>
      </template>
    </v-toolbar>
    <v-form ref="taskForm" class="pa-4" @submit.prevent="submitTask">
      <v-text-field
        v-model="name"
        :label="t('spaces.detail.publishTask.taskName')"
        required
        v-bind="nameProps"
      ></v-text-field>
      <v-radio-group
        v-model="submitterType"
        :label="t('spaces.detail.publishTask.participantType')"
        required
        inline
        v-bind="submitterTypeProps"
      >
        <v-radio :label="t('spaces.detail.publishTask.individual')" value="USER"></v-radio>
        <v-radio :label="t('spaces.detail.publishTask.team')" value="TEAM"></v-radio>
      </v-radio-group>
      <v-radio-group
        v-model="rank"
        :label="t('spaces.detail.publishTask.taskLevel')"
        required
        inline
        v-bind="rankProps"
      >
        <v-radio :label="t('spaces.detail.publishTask.beginner')" :value="1"></v-radio>
        <v-radio :label="t('spaces.detail.publishTask.intermediate')" :value="2"></v-radio>
        <v-radio :label="t('spaces.detail.publishTask.advanced')" :value="3"></v-radio>
      </v-radio-group>
      <v-text-field
        v-model="deadline"
        :label="t('spaces.detail.publishTask.deadline')"
        type="datetime-local"
        required
        v-bind="deadlineProps"
      ></v-text-field>
      <div class="d-flex align-center gap-4">
        <v-checkbox
          v-model="resubmittable"
          :label="t('spaces.detail.publishTask.allowMultipleSubmissions')"
          color="primary"
          v-bind="resubmittableProps"
        ></v-checkbox>
        <v-checkbox
          v-model="editable"
          :label="t('spaces.detail.publishTask.allowEditSubmissions')"
          color="primary"
          v-bind="editableProps"
        ></v-checkbox>
      </div>
      <TipTapEditor
        ref="descriptionEditor"
        v-model="taskDescription"
        output="json"
        rounded
        :min-height="200"
        :max-height="1000"
        editor-class="tiptap-editor"
        :title="t('spaces.detail.publishTask.taskDescription')"
      />
      <!-- <div v-for="(entry, index) in taskSubmissionSchema" :key="index" class="submission-schema-entry mt-4 pa-4">
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
      </div> -->

      <div class="d-flex justify-end publish-task-btn-group mt-4">
        <!-- <v-menu open-on-hover>
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
        </v-menu> -->
        <v-btn type="submit" color="primary" :loading="isSubmitting">{{ t('spaces.detail.publishTask.submit') }}</v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TasksApi } from '@/network/api/tasks'
import { TaskSubmissionSchemaEntry } from '@/types'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { z } from 'zod'
import { vuetifyConfig } from '@/utils/form'
import { JSONContent } from 'vuetify-pro-tiptap'
import { useSpaceStore } from '@/store/space'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

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

const spaceStore = useSpaceStore()
const { currentSpaceId, templates } = storeToRefs(spaceStore)

const { t } = useI18n()

const submitTask = handleSubmit(async (value) => {
  console.log(value)
  let intro = descriptionEditor.value?.editor?.getText() ?? ''
  if (intro.length > 250) {
    intro = intro.slice(0, 250) + '……'
  }
  const spaceId = currentSpaceId.value
  if (!spaceId) {
    console.error('Space ID not found')
    return
  }
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
    console.error(t('spaces.detail.publishTask.createTaskFailed'), error)
  }
})

onMounted(async () => {
  const templateId = route.query.templateId
  if (templateId && templateId !== 'blank') {
    await loadTemplate(Number(templateId))
  }
})

const loadTemplate = async (templateId: number) => {
  const template = templates.value[templateId]
  if (template) {
    name.value = template.title
    taskDescription.value = JSON.parse(template.content)
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
