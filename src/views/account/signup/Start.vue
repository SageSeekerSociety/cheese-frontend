<template>
  <v-card class="mx-auto" max-width="600" width="100%">
    <v-card-title>注册</v-card-title>
    <v-card-text>
      <v-alert v-if="error" closable :text="error" type="error" class="mb-4"></v-alert>

      <v-form ref="signupForm" @submit.prevent="submit">
        <v-text-field
          v-model="username"
          label="用户名"
          placeholder="请输入用户名"
          prepend-inner-icon="mdi-account"
          type="text"
          hint="用户名是用于登录的唯一标识，只能使用英文字母、数字、下划线"
          v-bind="usernameProps"
          required
        />
        <v-text-field
          v-model="nickname"
          label="昵称"
          placeholder="请输入昵称"
          prepend-inner-icon="mdi-account"
          type="text"
          v-bind="nicknameProps"
          required
        />
        <v-text-field
          v-model="password"
          label="密码"
          placeholder="请输入密码"
          prepend-inner-icon="mdi-lock"
          type="password"
          v-bind="passwordProps"
          required
        />
        <v-text-field
          v-model="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          prepend-inner-icon="mdi-lock"
          type="password"
          v-bind="confirmPasswordProps"
          required
        />
        <v-text-field
          v-model="email"
          label="邮箱"
          placeholder="请输入邮箱"
          prepend-inner-icon="mdi-email"
          type="email"
          v-bind="emailProps"
          required
        />
        <v-checkbox v-model="agree" density="compact" v-bind="agreeProps" required>
          <template #label>
            我已阅读并同意
            <a href="#">用户协议</a>
            和
            <a href="#">隐私政策</a>
          </template>
        </v-checkbox>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" color="primary" to="signin">已有账号</v-btn>
      <v-spacer />
      <v-btn color="primary" :loading="isSubmitting" @click="submit">注册</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { REGEX_PASSWORD, vuetifyConfig } from '@/utils/form'

import { ServerError } from '@/network/types/error'
import { useSignupStore } from '@/store/signup'

const error = ref('')

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z
      .object({
        username: z
          .string()
          .min(4)
          .max(32)
          .regex(/^[a-zA-Z0-9_-]{4,32}$/, {
            message: '用户名只能使用英文字母、数字、下划线',
          }),
        nickname: z
          .string()
          .min(1)
          .max(16)
          .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]{1,16}$/, {
            message: '昵称只能使用英文字母、数字、下划线、中文',
          }),

        password: z.string().min(8).regex(REGEX_PASSWORD, {
          message: '密码必须包含字母、数字、特殊字符',
        }),

        confirmPassword: z.string().min(8).regex(REGEX_PASSWORD, {
          message: '密码必须包含字母、数字、特殊字符',
        }),
        email: z.string().email(),
        agree: z.boolean().refine((v) => v, { message: '请同意用户协议和隐私政策' }),
      })
      .superRefine(({ password, confirmPassword }, ctx) => {
        if (password !== confirmPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: '两次输入的密码不一致',
          })
        }
      })
  ),
})

const [username, usernameProps] = defineField('username', vuetifyConfig)
const [nickname, nicknameProps] = defineField('nickname', vuetifyConfig)
const [password, passwordProps] = defineField('password', vuetifyConfig)
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword', vuetifyConfig)
const [email, emailProps] = defineField('email', vuetifyConfig)
const [agree, agreeProps] = defineField('agree', vuetifyConfig)

const signupStore = useSignupStore()
const router = useRouter()

const submit = handleSubmit(async (value) => {
  try {
    await signupStore.startSignup(value)
    router.push('/account/signup/verify-email')
  } catch (e) {
    if (e instanceof ServerError) {
      error.value = e.message
    } else {
      toast.error(e as string)
    }
  }
})
</script>
