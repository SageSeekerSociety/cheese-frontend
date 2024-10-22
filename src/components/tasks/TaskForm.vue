<template>
  <v-form ref="taskForm" @submit.prevent="submitForm">
    <v-text-field v-model="formData.name" :label="t('tasks.form.taskName')" required v-bind="nameProps"></v-text-field>
    <v-radio-group
      v-model="formData.submitterType"
      :label="t('tasks.form.participantType')"
      required
      inline
      v-bind="submitterTypeProps"
    >
      <v-radio :label="t('tasks.form.individual')" value="USER"></v-radio>
      <v-radio :label="t('tasks.form.team')" value="TEAM"></v-radio>
    </v-radio-group>
    <v-radio-group v-model="formData.rank" :label="t('tasks.form.taskLevel')" required inline v-bind="rankProps">
      <v-radio :label="t('tasks.form.beginner')" :value="1"></v-radio>
      <v-radio :label="t('tasks.form.intermediate')" :value="2"></v-radio>
      <v-radio :label="t('tasks.form.advanced')" :value="3"></v-radio>
    </v-radio-group>
    <v-text-field
      v-model="formData.deadline"
      :label="t('tasks.form.deadline')"
      type="datetime-local"
      required
      v-bind="deadlineProps"
    ></v-text-field>
    <div class="d-flex align-center gap-4">
      <v-checkbox
        v-model="formData.resubmittable"
        :label="t('tasks.form.allowMultipleSubmissions')"
        color="primary"
        v-bind="resubmittableProps"
      ></v-checkbox>
      <v-checkbox
        v-model="formData.editable"
        :label="t('tasks.form.allowEditSubmissions')"
        color="primary"
        v-bind="editableProps"
      ></v-checkbox>
    </div>
    <TipTapEditor
      ref="descriptionEditor"
      v-model="formData.description"
      output="json"
      rounded
      :min-height="200"
      :max-height="1000"
      editor-class="tiptap-editor"
      :title="t('tasks.form.taskDescription')"
    />
    <div class="d-flex justify-end mt-4">
      <v-btn type="submit" color="primary" :loading="isSubmitting">{{ submitButtonText }}</v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import type { TaskFormSubmitData } from '@/types'

import { defineEmits, defineProps, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { JSONContent } from 'vuetify-pro-tiptap'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'

import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import { TaskSubmitterType } from '@/types'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  submitButtonText: {
    type: String,
    default: '提交',
  },
})

const emit = defineEmits<{
  submit: [data: TaskFormSubmitData]
}>()

const { t } = useI18n()

const taskForm = ref(null)
const descriptionEditor = ref(null)

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
  initialValues: props.initialData,
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [submitterType, submitterTypeProps] = defineField('submitterType', vuetifyConfig)
const [rank, rankProps] = defineField('rank', vuetifyConfig)
const [deadline, deadlineProps] = defineField('deadline', vuetifyConfig)
const [resubmittable, resubmittableProps] = defineField('resubmittable', vuetifyConfig)
const [editable, editableProps] = defineField('editable', vuetifyConfig)

const formData = reactive({
  name,
  submitterType,
  rank,
  deadline,
  resubmittable,
  editable,
  description: props.initialData.description || { type: 'doc', content: [] },
})

const submitForm = handleSubmit((values) => {
  const submissionData: TaskFormSubmitData = {
    ...values,
    description: JSON.stringify(formData.description),
    deadline: new Date(values.deadline).getTime(),
  }
  emit('submit', submissionData)
})
</script>
