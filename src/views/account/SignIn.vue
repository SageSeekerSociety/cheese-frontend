<template>
  <v-card class="mx-auto" max-width="600" width="100%">
    <v-card-title>登录</v-card-title>
    <v-card-text>
      <v-form @submit="login" ref="loginForm">
        <v-text-field label="用户名" placeholder="请输入用户名" prepend-inner-icon="mdi-account" type="text" v-model="username"
          v-bind="usernameProps" required />
        <v-text-field label="密码" placeholder="请输入密码" prepend-inner-icon="mdi-lock" type="password" v-model="password"
          v-bind="passwordProps" required />
        <v-checkbox density="compact" v-model="agree" v-bind="agreeProps" required>
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
      <v-btn variant="text" color="primary" to="signup">注册账户</v-btn>
      <v-btn variant="plain" color="on-background" to="recover/password">无法登录？</v-btn>
      <v-spacer />
      <v-btn color="primary" @click="login" :loading="isSubmitting">登录</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { toast } from 'vuetify-sonner'
import { UserApi } from '@/network/api/user'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { ServerError } from '@/network/types/error'
import AccountService from '@/services/account'
import { useRouter } from 'vue-router'
import { vuetifyConfig } from '@/utils/form'

const router = useRouter()

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      username: z.string().min(4).max(16),
      password: z.string().min(8),
      agree: z.boolean().refine((v) => v, {
        message: '请同意用户协议和隐私政策',
      })
    })
  )
})

const [username, usernameProps] = defineField('username', vuetifyConfig)
const [password, passwordProps] = defineField('password', vuetifyConfig)
const [agree, agreeProps] = defineField('agree', vuetifyConfig)

const login = handleSubmit(async (value) => {
  try {
    const { data } = await UserApi.login(value)
    AccountService.login(data.accessToken, data.user)
    toast.success('登录成功')
    router.replace('/')
  } catch (e) {
    if (e instanceof ServerError) {
      toast.error(e.message)
    }
  }
});
</script>
