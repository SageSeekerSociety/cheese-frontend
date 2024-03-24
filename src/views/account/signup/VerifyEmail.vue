<template>
  <v-card class="mx-auto" max-width="600" width="100%">
    <v-card-title>验证你的邮箱</v-card-title>
    <v-card-text>
      我们已向你的邮箱发送了验证码，请输入验证码。
      <v-form @submit.prevent="submit">
        <v-otp-input v-model="otp" v-bind="otpProps" :disabled="isSubmitting"></v-otp-input>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" :loading="isSubmitting" @click="submit">注册</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useSignupStore } from '@/store/signup'
import { toast } from 'vuetify-sonner'
import AccountService from '@/services/account'
import { vuetifyConfig } from '@/utils/form'
import { useRouter } from 'vue-router'

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
  const res = await signupStore.signup(otp)
  if (res) {
    toast.success('注册成功')
    AccountService.login(res.data.accessToken, res.data.user)
    router.push('/')
  }
})
</script>
