<template>
  <v-card class="mx-auto" max-width="500" rounded="lg">
    <v-card-item
      class="bg-primary text-white"
      prepend-icon="mdi-email-check"
      title="邮箱验证"
      subtitle="验证码已发送至您的注册邮箱"
    />

    <v-card-text class="pa-6">
      <v-fade-transition mode="out-in">
        <div :key="String(isSubmitting)">
          <div class="text-body-2 text-medium-emphasis mb-4">验证码已发送至 {{ signupStore.email }}，有效期15分钟</div>

          <v-form @submit.prevent="submit">
            <div class="text-center">
              <v-otp-input
                v-model="otp"
                length="6"
                type="number"
                variant="outlined"
                :loading="isSubmitting"
                v-bind="otpProps"
                @update:model-value="handleOtpInput"
              />

              <v-btn
                block
                color="primary"
                size="large"
                class="mt-6"
                type="submit"
                :loading="isSubmitting"
                :disabled="otp?.length !== 6"
              >
                完成注册
              </v-btn>

              <div class="text-caption text-medium-emphasis mt-4">
                未收到验证码？
                <v-btn variant="text" color="primary" size="small" @click="handleResend"> 重新发送 </v-btn>
              </div>
            </div>
          </v-form>
        </div>
      </v-fade-transition>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'

import AccountService from '@/services/account'
import { useSignupStore } from '@/stores/signup'

const router = useRouter()

const signupStore = useSignupStore()

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      otp: z.string().length(6, { message: '验证码必须是6位数字' }).default(''),
    })
  ),
})

const [otp, otpProps] = defineField('otp', vuetifyConfig)
const submit = handleSubmit(async ({ otp }) => {
  try {
    const res = await signupStore.signup(otp)
    if (res) {
      toast.success('注册成功')
      router.push({
        name: 'SignIn',
        query: {
          username: signupStore.username,
          message: '注册成功，请使用新账号登录',
        },
      })
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '验证失败')
  }
})

const handleOtpInput = (value: string) => {
  if (value.length === 6) {
    submit()
  }
}

const handleResend = async () => {
  try {
    // await signupStore.resendVerification()
    toast.success('验证码已重新发送')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '发送失败')
  }
}
</script>
