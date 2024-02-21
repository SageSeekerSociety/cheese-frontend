<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-card class="mx-auto" max-width="600" width="100%">
        <v-card-title>创建圈子</v-card-title>
        <v-card-text>
          <v-alert v-if="error" closable :text="error" type="error" class="mb-4"></v-alert>
          <v-row>
            <v-col cols="8">
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
                <v-list-subheader inset>头像</v-list-subheader>
                <v-file-input
                  v-model="selectedFile"
                  accept="image/*"
                  prepend-icon="mdi-plus"
                  label="选择文件"
                  chips
                  show-size
                  show-size-hint
                  outlined
                  @change="handleFileChange"
                />
              </v-form>
            </v-col>
            <v-col cols="4">
              <v-list-subheader inset>预览</v-list-subheader>
              <v-img height="200px" width="200px">
                <v-img
                  v-if="selectedFile.length > 0"
                  :src="previewUrl"
                  aspect-ratio="1"
                  class="rounded-lg"
                  rounded="0"
                  size="180"
                />
                <v-img
                  v-else
                  :src="fakeavatar"
                  color="grey-darken-1"
                  aspect-ratio="1"
                  class="rounded-lg"
                  rounded="0"
                  size="180"
                />
              </v-img>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :loading="isSubmitting" @click="submit">创建</v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toast } from 'vuetify-sonner'
import { REGEX_PASSWORD, vuetifyConfig } from '@/utils/form'

import { ImageApi } from '@/network/api/image'
import { ServerError } from '@/network/types/error'

const error = ref('')
const selectedFile = ref([])
const previewUrl = ref('')

const handleFileChange = () => {
  if (selectedFile.value) {
    readAvatar()
  } else {
    previewUrl.value = ''
  }
}

const readAvatar = () => {
  const reader = new FileReader()
  reader.onload = (event) => {
    previewUrl.value = event.target?.result as string
  }
  reader.readAsDataURL(selectedFile.value[0] as Blob)
}
const uploadAvatar = () => {
  const formData = new FormData()
  formData.append('file', selectedFile.value[0])
  const result = ImageApi.upload(formData)
  return result
}

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
const router = useRouter()
const fakeavatar = 'https://cdn.vuetifyjs.com/images/parallax/material.jpg'
function submit() {
  console.log('submit')
}
// const submit = handleSubmit(async (value) => {
//   try {
//     await signupStore.startSignup(value)
//     router.push('/account/signup/verify-email')
//   } catch (e) {
//     if (e instanceof ServerError) {
//       error.value = e.message
//     } else {
//       toast.error(e as string)
//     }
//   }
// })
</script>
