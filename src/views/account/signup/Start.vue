<template>
  <v-card class="mx-auto" max-width="500" rounded="lg">
    <v-card-item
      class="bg-primary text-white"
      prepend-icon="mdi-account-plus"
      title="加入知是社区"
      subtitle="开启您的知识共享之旅"
    />

    <v-card-text class="pa-6">
      <v-alert v-if="error" closable type="error" density="compact" class="mb-4">
        {{ error }}
      </v-alert>

      <v-fade-transition>
        <v-form ref="signupForm" @submit.prevent="submit">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="username"
                label="用户名"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :loading="isSubmitting"
                v-bind="usernameProps"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="nickname"
                label="显示名称"
                variant="outlined"
                prepend-inner-icon="mdi-card-account-details"
                :loading="isSubmitting"
                v-bind="nicknameProps"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="password"
                label="密码"
                type="password"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :loading="isSubmitting"
                v-bind="passwordProps"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="confirmPassword"
                label="确认密码"
                type="password"
                variant="outlined"
                prepend-inner-icon="mdi-lock-check"
                :loading="isSubmitting"
                v-bind="confirmPasswordProps"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="email"
                label="电子邮箱"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                :loading="isSubmitting"
                v-bind="emailProps"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-space-between align-center mb-4">
            <v-checkbox v-model="agree" density="compact" class="flex-grow-0" v-bind="agreeProps">
              <template #label>
                <span class="text-caption"
                  >同意 <a href="#" class="text-primary">用户协议</a>和
                  <a href="#" class="text-primary">隐私政策</a>
                </span>
              </template>
            </v-checkbox>
            <v-btn variant="text" color="primary" to="/account/signin" size="small">已有账号</v-btn>
          </div>

          <v-btn block color="primary" size="large" type="submit" :loading="isSubmitting"> 立即注册 </v-btn>
        </v-form>
      </v-fade-transition>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import * as srp from 'secure-remote-password/client'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { REGEX_PASSWORD, vuetifyConfig } from '@/utils/form'

import { ServerError } from '@/network/types/error'
import { useSignupStore } from '@/stores/signup'

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
    // 生成 SRP 盐值和验证器
    const srpSalt = srp.generateSalt()
    const privateKey = srp.derivePrivateKey(srpSalt, value.username, value.password)
    const srpVerifier = srp.deriveVerifier(privateKey)

    // 将 SRP 参数保存到 store 中，供后续注册使用
    await signupStore.startSignup({
      ...value,
      srpSalt,
      srpVerifier,
    })

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
