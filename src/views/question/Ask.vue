<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet rounded="lg" class="pa-4">
          <v-form>
            <v-text-field
              v-model="title"
              label="问题标题"
              variant="plain"
              class="question-title-input"
              hide-details="auto"
              :single-line="true"
              v-bind="titleProps"
            ></v-text-field>
            <rich-editor holder="editor" :config="DEFAULT_CONFIG" @create="onCreate" />
            <topic-selector v-model="topics" class="mt-4" v-bind="topicsProps" />
          </v-form>
        </v-sheet>
      </v-col>

      <v-col cols="3">
        <v-sheet rounded="lg" class="pa-2 mb-4"> 提问的艺术 </v-sheet>
        <v-btn block flat rounded="lg" :loading="isSubmitting" @click="submit"> 发布问题 </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import RichEditor from '@/components/common/Editor/Editor.vue'
import EditorJS from '@editorjs/editorjs'
import { QuestionApi } from '@/network/api/questions'
import { useRouter } from 'vue-router'
import { DEFAULT_CONFIG } from '@/utils/editor'
import { toast } from 'vuetify-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { vuetifyConfig } from '@/utils/form'
import TopicSelector from '@/components/questions/TopicSelector.vue'

let editor: EditorJS
const router = useRouter()

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      title: z
        .string()
        .trim()
        .refine((v) => v.length > 0, {
          message: '问题标题不能为空',
        })
        .refine((v) => v.endsWith('?') || v.endsWith('？'), {
          message: '问题标题必须以问号结尾',
        }),
      topics: z
        .object({
          id: z.number(),
          name: z.string(),
        })
        .array()
        .refine((v) => v.length > 0, {
          message: '至少选择一个话题',
        }),
    })
  ),
})
const [title, titleProps] = defineField('title', vuetifyConfig)
const [topics, topicsProps] = defineField('topics', vuetifyConfig)

const onCreate = (editorInstance: EditorJS) => {
  editor = editorInstance
}

const submit = handleSubmit(async (values) => {
  const outputData = await editor.save()
  const content = JSON.stringify(outputData)
  const res = await QuestionApi.ask({
    title: values.title,
    content,
    type: 0,
    topics: values.topics.map((topic) => topic.id),
  })
  toast.success('提问成功')
  router.push({ name: 'QuestionAnswerList', params: { questionId: res.data.id } })
})
</script>

<style>
.ce-block__content,
.ce-toolbar__content {
  max-width: unset;
}

.ce-block__content {
  padding: 0;
}

.question-title-input {
  font-weight: bold;
}
.question-title-input .v-field__input,
.question-title-input .v-field-label {
  font-size: 1.5rem;
}

.question-topics {
  gap: 8px;
}

.question-topic-input {
  width: 240px;
}
</style>
