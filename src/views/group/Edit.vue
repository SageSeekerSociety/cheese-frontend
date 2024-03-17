<template>
  <v-container>
    <v-layout align-center justify-center>
      <v-card class="mx-auto" max-width="600" width="100%">
        <v-card-title>管理圈子</v-card-title>
        <v-card-text>
          <v-alert v-if="error" closable :text="error" type="error" class="mb-4"></v-alert>
          <v-row>
            <v-col cols="20">
              <v-form ref="signupForm" @submit.prevent="submit">
                <v-text-field
                  v-model="name"
                  label="圈子名称"
                  placeholder="请输入圈子名称"
                  prepend-inner-icon="mdi-account"
                  type="text"
                  v-bind="nameProps"
                  required
                />
                <v-text-field
                  v-model="intro"
                  label="圈子简述"
                  placeholder="请输入圈子简述"
                  prepend-inner-icon="mdi-account"
                  type="text"
                  v-bind="nameProps"
                  required
                />
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <!-- <v-spacer></v-spacer> -->
          <v-btn color="primary" :loading="isSubmitting" @click="submit">创建</v-btn>
        </v-card-actions>
      </v-card></v-layout
    >
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
        }),
      // eslint-disable-next-line no-control-regex
      intro: z.string().min(1).max(20),
    })
  ),
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [intro, introProps] = defineField('intro', vuetifyConfig)
function submit() {}
</script>
