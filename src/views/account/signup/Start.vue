<template>
  <div>
    <!-- 标题区域 - 美观大气 -->
    <div class="mb-12">
      <div class="d-flex align-center mb-3">
        <v-icon color="primary" size="28" class="mr-3">mdi-account-plus</v-icon>
        <h1 class="text-h3 font-weight-light" style="color: #212121; line-height: 1.2">加入知是社区</h1>
      </div>
      <p class="text-body-1" style="color: #757575; line-height: 1.5">开启您的知识共享之旅</p>
    </div>

    <!-- 错误提示区域 -->
    <div v-if="error" class="mb-8">
      <v-alert closable type="error" variant="tonal" density="comfortable">
        {{ error }}
      </v-alert>
    </div>

    <v-fade-transition>
      <!-- 注册表单区域 -->
      <div class="mb-8">
        <v-form ref="signupForm" @submit.prevent="submit">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="username"
                label="用户名"
                variant="outlined"
                :loading="isSubmitting"
                v-bind="usernameProps"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="nickname"
                label="显示名称"
                variant="outlined"
                :loading="isSubmitting"
                v-bind="nicknameProps"
                class="mb-4"
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
                :loading="isSubmitting"
                v-bind="passwordProps"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="confirmPassword"
                label="确认密码"
                type="password"
                variant="outlined"
                :loading="isSubmitting"
                v-bind="confirmPasswordProps"
                class="mb-4"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="email"
            label="电子邮箱"
            type="email"
            variant="outlined"
            :loading="isSubmitting"
            v-bind="emailProps"
            class="mb-6"
          />

          <div class="d-flex justify-space-between align-center mb-6">
            <v-checkbox v-model="agree" density="compact" v-bind="agreeProps" hide-details>
              <template #label>
                <span class="text-body-2" style="color: #616161; line-height: 1.4">
                  同意 <a href="#" class="text-primary text-decoration-none">用户协议</a>和
                  <a href="#" class="text-primary text-decoration-none">隐私政策</a>
                </span>
              </template>
            </v-checkbox>
            <v-btn variant="text" color="primary" to="/account/signin" size="small" style="text-transform: none">
              已有账号
            </v-btn>
          </div>

          <v-btn
            block
            color="primary"
            size="large"
            type="submit"
            :loading="isSubmitting"
            style="text-transform: none; font-weight: 500; height: 48px"
            class="mb-4"
          >
            立即注册
          </v-btn>

          <p class="text-body-2" style="color: #757575">
            已经有账号了？
            <v-btn
              variant="text"
              color="primary"
              to="/account/signin"
              size="small"
              style="text-transform: none; padding: 0; min-width: auto; height: auto; vertical-align: baseline"
              class="text-decoration-none"
            >
              立即登录
            </v-btn>
          </p>
        </v-form>
      </div>
    </v-fade-transition>
  </div>
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
