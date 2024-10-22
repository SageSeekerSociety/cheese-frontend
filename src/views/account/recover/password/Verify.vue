<template>
  <v-card class="mx-auto" max-width="600" width="100%">
    <v-card-title>设置新密码</v-card-title>
    <v-card-text>
      <v-alert v-if="myAlert.message" closable :text="myAlert.message" :type="myAlert.type" class="mb-4"></v-alert>
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="password"
          label="新密码"
          placeholder="请输入新密码"
          prepend-inner-icon="mdi-lock"
          type="password"
          v-bind="passwordProps"
          required
        />
        <v-text-field
          v-model="confirmPassword"
          label="确认密码"
          placeholder="请再次输入新密码"
          prepend-inner-icon="mdi-lock"
          type="password"
          v-bind="confirmPasswordProps"
          required
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" :loading="isSubmitting" @click="submit">提交</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { RULE_PASSWORD, vuetifyConfig } from '@/utils/form'

import { UserApi } from '@/network/api/users'
import { ServerError } from '@/network/types/error'

const route = useRoute()
const token = computed(() => route.query.token as string)

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
    await UserApi.recoverPasswordVerify({
      token: token.value,
      newPassword: value.password,
    })
    toast.success('密码重置成功，请重新登录')
    router.replace('/account/signin')
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
