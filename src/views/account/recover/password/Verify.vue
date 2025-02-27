<template>
  <v-card class="mx-auto" max-width="500" rounded="lg">
    <v-card-item
      class="bg-primary text-white"
      prepend-icon="mdi-key-change"
      title="设置新密码"
      subtitle="请设置安全的新登录密码"
    />

    <v-card-text class="pa-6">
      <v-fade-transition mode="out-in">
        <div :key="String(isSubmitting)">
          <v-alert v-if="myAlert.message" :type="myAlert.type" density="compact" class="mb-4">
            {{ myAlert.message }}
          </v-alert>

          <v-form @submit.prevent="submit">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="password"
                  label="新密码"
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

            <v-btn block color="primary" size="large" type="submit" :loading="isSubmitting" class="mt-2">
              确认重置
            </v-btn>
          </v-form>
        </div>
      </v-fade-transition>
    </v-card-text>
  </v-card>
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
