<template>
  <v-card class="mx-auto" max-width="600" width="100%">
    <v-card-title>找回密码</v-card-title>
    <v-card-text>
      <v-alert v-if="myAlert.message" closable :text="myAlert.message" :type="myAlert.type" class="mb-4"></v-alert>

      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="email"
          label="邮箱"
          placeholder="请输入邮箱"
          prepend-inner-icon="mdi-email"
          type="email"
          v-bind="emailProps"
          required
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" color="primary" to="/account/signin">返回登录</v-btn>
      <v-spacer />
      <v-btn color="primary" :loading="isSubmitting" @click="submit">提交</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'

import { UserApi } from '@/network/api/users'
import { ServerError } from '@/network/types/error'

const myAlert = ref<{
  message: string | undefined
  type: 'success' | 'info' | 'warning' | 'error' | undefined
}>({
  message: '',
  type: 'error',
})

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      email: z.string().email(),
    })
  ),
})

const [email, emailProps] = defineField('email', vuetifyConfig)

// const router = useRouter()

const submit = handleSubmit(async (value) => {
  try {
    await UserApi.recoverPasswordRequest(value.email)
    myAlert.value = {
      message: '重置密码邮件已发送，请注意查收',
      type: 'success',
    }
  } catch (e) {
    if (e instanceof ServerError) {
      myAlert.value = {
        message: e.message,
        type: 'error',
      }
    } else {
      toast.error(e as string)
    }
  }
})
</script>
@/network/api/users/user
