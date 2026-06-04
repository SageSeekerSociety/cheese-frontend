<template>
  <div>
    <!-- 标题区域 -->
    <div class="mb-12">
      <div class="d-flex align-center mb-3">
        <v-icon color="primary" size="28" class="mr-3">mdi-email-check</v-icon>
        <h1 class="text-h3 font-weight-light" style="color: #212121; line-height: 1.2">验证邮箱地址</h1>
      </div>
      <p class="text-body-1" style="color: #757575; line-height: 1.5">
        我们已向 <strong style="color: #424242">{{ signupStore.email }}</strong> 发送了验证码
      </p>
    </div>

    <v-fade-transition mode="out-in">
      <div :key="String(isSubmitting)">
        <!-- 验证表单区域 -->
        <div class="mb-8">
          <v-form @submit.prevent="submit">
            <v-otp-input
              v-model="otp"
              length="6"
              type="number"
              variant="outlined"
              :loading="isSubmitting"
              v-bind="otpProps"
              class="mb-6"
              @update:model-value="handleOtpInput"
            />

            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="isSubmitting"
              :disabled="otp?.length !== 6"
              style="text-transform: none; font-weight: 500; height: 48px"
              class="mb-6"
            >
              完成注册
            </v-btn>

            <div class="d-flex align-center justify-space-between">
              <p class="text-body-2" style="color: #757575">
                没有收到验证码？
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  style="text-transform: none; padding: 0; min-width: auto; height: auto; vertical-align: baseline"
                  class="text-decoration-none"
                  @click="handleResend"
                >
                  重新发送
                </v-btn>
              </p>
              <v-btn variant="text" color="primary" to="/account/signin" size="small" style="text-transform: none">
                返回登录
              </v-btn>
            </div>
          </v-form>
        </div>
      </div>
    </v-fade-transition>
  </div>
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
