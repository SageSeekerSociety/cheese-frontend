<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="9">
        <v-sheet rounded="lg" class="pa-4">
          <v-form @submit.prevent>
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
            <div class="d-flex align-center" style="gap: 16px">
              <v-btn
                variant="text"
                :prepend-icon="hasBounty ? 'mdi-currency-usd-off' : 'mdi-currency-usd'"
                @click="hasBounty ? removeBounty() : addBounty()"
              >
                {{ hasBounty ? '取消悬赏' : '添加悬赏' }}
              </v-btn>
              <v-slide-x-reverse-transition mode="out-in">
                <v-slider
                  v-if="hasBounty"
                  v-model="bounty"
                  thumb-label="always"
                  v-bind="bountyProps"
                  min="1"
                  max="20"
                  step="1"
                  show-ticks
                  hide-details
                  class="flex-auto"
                >
                  <template #append>
                    <span style="vertical-align: baseline; min-width: 5rem; text-align: end">
                      <span>悬赏 {{ bounty }} </span><v-icon>mdi-cheese</v-icon>
                    </span>
                  </template>
                </v-slider>
              </v-slide-x-reverse-transition>
            </div>
          </v-form>
        </v-sheet>
      </v-col>

      <v-col cols="12" md="4" lg="3">
        <v-btn block flat rounded="lg" :loading="isSubmitting" class="mb-4" @click="submit"> 发布问题 </v-btn>
        <v-sheet rounded="lg" class="pa-4 mb-4">
          <div class="text-h5">提问的艺术</div>
          <p>
            当提问时，请先简要分享你已经做过的尝试，这有助于展示你的积极态度，表明你不是想轻易获取答案，而是真心寻求帮助。我们更愿意帮助那些通过提问能够学到东西的人。
          </p>
          <p>请确保你的问题经过深思熟虑。展现出你在求助前已经努力尝试解决问题，这样更容易获得有价值的回答。</p>
          <p>确保你的问题建立在正确的基础上。提出有意义且具有启发性的问题，这不仅能帮助自己，也能对社区有所贡献。</p>
          <p>
            最后，表示你愿意在解决问题的过程中做出努力，例如，通过问“有哪些提示可以给我？”或“我应该检查哪里？”来显示你的积极性和解决问题的决心，通常能得到更好的回答。
          </p>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type EditorJS from '@editorjs/editorjs'

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { DEFAULT_CONFIG } from '@/utils/editor'
import { vuetifyConfig } from '@/utils/form'

import RichEditor from '@/components/common/Editor/Editor.vue'
import TopicSelector from '@/components/questions/TopicSelector.vue'
import { QuestionApi } from '@/network/api/questions'

let editor: EditorJS
const router = useRouter()
const route = useRoute()

const groupId = computed(() => route.query.groupId)

// watch(groupId, (groupId) => {
//   if (groupId) {
//     topics.value = [{ id: groupId as number, name: '' }]
//   }
// })

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
      bounty: z.number().min(0).max(20).default(0),
    })
  ),
})
const [title, titleProps] = defineField('title', vuetifyConfig)
const [topics, topicsProps] = defineField('topics', vuetifyConfig)
const [bounty, bountyProps] = defineField('bounty', vuetifyConfig)

const onCreate = (editorInstance: EditorJS) => {
  editor = editorInstance
}

const hasBounty = ref(false)

const addBounty = () => {
  hasBounty.value = true
  bounty.value = 1
}

const removeBounty = () => {
  hasBounty.value = false
  bounty.value = 0
}

const submit = handleSubmit(async (values) => {
  const outputData = await editor.save()
  const content = JSON.stringify(outputData)
  const res = await QuestionApi.ask({
    title: values.title,
    content,
    type: 0,
    topics: values.topics.map((topic) => topic.id),
    bounty: bounty.value ?? 0,
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
