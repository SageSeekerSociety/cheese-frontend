<template>
  <div>
    <!-- 标题区域 - 美观大气 -->
    <div class="mb-12">
      <div class="d-flex align-center mb-3">
        <v-icon color="primary" size="28" class="mr-3">mdi-key-change</v-icon>
        <h1 class="text-h3 font-weight-light" style="color: #212121; line-height: 1.2">设置新密码</h1>
      </div>
      <p class="text-body-1" style="color: #757575; line-height: 1.5">请设置安全的新登录密码</p>
    </div>

    <!-- 错误/成功提示区域 -->
    <div v-if="myAlert.message" class="mb-8">
      <v-alert :type="myAlert.type" variant="tonal" density="comfortable">
        {{ myAlert.message }}
      </v-alert>
    </div>

    <v-fade-transition mode="out-in">
      <div :key="String(isSubmitting)">
        <!-- 密码重置表单区域 -->
        <div class="mb-8">
          <v-form @submit.prevent="submit">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="password"
                  label="新密码"
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

            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="isSubmitting"
              style="text-transform: none; font-weight: 500; height: 48px"
              class="mb-4"
            >
              确认重置密码
            </v-btn>

            <p class="text-body-2" style="color: #757575">
              想要返回？
              <v-btn
                variant="text"
                color="primary"
                to="/account/signin"
                size="small"
                style="text-transform: none; padding: 0; min-width: auto; height: auto; vertical-align: baseline"
                class="text-decoration-none"
              >
                <v-icon start size="16">mdi-arrow-left</v-icon>
                返回登录
              </v-btn>
            </p>
          </v-form>
        </div>
      </div>
    </v-fade-transition>
  </div>
</template>

<script lang="ts" setup>
import type { TokenPayload } from '@/network/api/users/types'

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { jwtDecode } from 'jwt-decode'
import * as srp from 'secure-remote-password/client'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { RULE_PASSWORD, vuetifyConfig } from '@/utils/form'

import { UserApi } from '@/network/api/users'
import { ServerError } from '@/network/types/error'

const route = useRoute()
const token = computed(() => route.query.token as string)

// 从 token 中解析用户名
const username = computed(() => {
  try {
    const { payload } = jwtDecode<TokenPayload>(token.value)
    console.log(payload, token.value)
    return payload.authorization.username
  } catch (e) {
    console.error('无效的 token:', e)
    return undefined
  }
})

const myAlert = ref<{
  message: string | undefined
  type: 'success' | 'info' | 'warning' | 'error' | undefined
}>({
  message: '',
  type: 'error',
})

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z
      .object({
        password: RULE_PASSWORD,
        confirmPassword: RULE_PASSWORD,
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

const [password, passwordProps] = defineField('password', vuetifyConfig)
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword', vuetifyConfig)

const router = useRouter()

const submit = handleSubmit(async (value) => {
  try {
    if (!username.value) {
      throw new Error('无效的重置链接')
    }

    // 生成 SRP 盐值和验证器
    const srpSalt = srp.generateSalt()
    const privateKey = srp.derivePrivateKey(srpSalt, username.value, value.password)
    const srpVerifier = srp.deriveVerifier(privateKey)

    await UserApi.recoverPasswordVerify({
      token: token.value,
      srpSalt,
      srpVerifier,
    })

    toast.success('密码重置成功，请重新登录')
    router.replace({
      name: 'SignIn',
      query: {
        username: username.value,
        message: '密码重置成功，请使用新密码登录',
      },
    })
  } catch (e) {
    if (e instanceof ServerError) {
      myAlert.value = {
        message: e.message,
        type: 'error',
      }
    } else {
      toast.error(e instanceof Error ? e.message : '重置失败')
    }
  }
})
</script>
