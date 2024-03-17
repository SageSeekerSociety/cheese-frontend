<template>
  <v-container>
    <v-card class="mx-auto" width="600" flat>
      <v-card-title>管理圈子</v-card-title>
      <v-card-text class="pb-0">
        <v-alert v-if="error" closable :text="error" type="error" class="mb-4"></v-alert>
        <v-form ref="signupForm" @submit.prevent="submit">
          <v-text-field v-model="name" label="圈子名称" prepend-inner-icon="mdi-account" type="text" required />
          <v-text-field v-model="intro" label="圈子简述" prepend-inner-icon="mdi-account" type="text" required />
          <v-checkbox v-model="approveCheck" :hide-details="true" label="是否允许加入申请" color="primary"></v-checkbox>
          <div v-if="approveCheck">
            <v-text-field
              v-model="question"
              :hide-details="true"
              label="验证问题"
              prepend-inner-icon="mdi-account"
              type="text"
              required
            />
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <!-- <v-spacer></v-spacer> -->
        <v-btn color="primary" :loading="isSubmitting" @click="submit">提交</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toast } from 'vuetify-sonner'
import { REGEX_PASSWORD, vuetifyConfig } from '@/utils/form'
import { ServerError } from '@/network/types/error'
import { GroupApi } from '@/network/api/group'

const approveCheck = ref(false)
const error = ref('')
const selectedFile = ref([])
const previewUrl = ref('')
const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z
        .string()
        .min(1)
        .max(16)
        .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]{1,16}$/, {
          message: '昵称只能使用英文字母、数字、下划线、中文',
        })
        .default('我圈你牛魔酬宾'),
      // eslint-disable-next-line no-control-regex
      intro: z.string().min(1).max(20).default('得了一种看见芝士点开圈子界面就会笑的病qwkheuahbsdfdjhbasndjlk'),
      question: z.string().min(1).max(20).default('你是谁'),
    })
  ),
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [intro, introProps] = defineField('intro', vuetifyConfig)
const [question, questionProps] = defineField('question', vuetifyConfig)
function submit() {}
</script>
