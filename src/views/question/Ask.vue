<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet rounded="lg" class="pa-1">
          <v-text-field
            v-model="title"
            label="问题标题"
            hide-details="auto"
            variant="plain"
            class="mx-4 question-title-input"
            :single-line="true"
            required
          ></v-text-field>
          <rich-editor holder="editor" :config="DEFAULT_CONFIG" @create="onCreate" />
        </v-sheet>
      </v-col>

      <v-col cols="3">
        <v-sheet rounded="lg" class="pa-2 mb-4"> 提问的艺术 </v-sheet>
        <v-btn block flat rounded="lg" @click="submit"> 发布问题 </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import RichEditor from '@/components/common/Editor/Editor.vue'
import { ref } from 'vue'
import EditorJS from '@editorjs/editorjs'
import { QuestionApi } from '@/network/api/questions'
import { useRouter } from 'vue-router'
import { DEFAULT_CONFIG } from '@/utils/editor'
import { toast } from 'vuetify-sonner'

let editor: EditorJS
const title = ref('')
const router = useRouter()

const onCreate = (editorInstance: EditorJS) => {
  editor = editorInstance
}

const submit = async () => {
  const outputData = await editor.save()
  const content = JSON.stringify(outputData)
  const res = await QuestionApi.ask({ title: title.value, content, type: 0, topics: [] })
  toast.success('提问成功')
  router.push({ name: 'QuestionAnswerList', params: { questionId: res.data.id } })
}
</script>

<style>
.ce-block__content,
.ce-toolbar__content {
  max-width: unset;
}

.ce-block__content {
  padding: 0 16px;
}

.question-title-input {
  font-weight: bold;
}
.question-title-input .v-field__input,
.question-title-input .v-field-label {
  font-size: 1.5rem;
}
</style>
