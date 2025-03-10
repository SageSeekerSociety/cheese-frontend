<template>
  <v-card class="mx-auto" max-width="500" rounded="lg">
    <v-card-item class="bg-primary text-white" prepend-icon="mdi-login" title="登录" subtitle="欢迎回到知是社区" />

    <v-card-text class="pa-6">
      <!-- 错误提示 -->
      <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <!-- 成功提示 -->
      <v-alert v-if="route.query.message" type="success" density="compact" class="mb-4">
        {{ route.query.message }}
      </v-alert>

      <v-fade-transition mode="out-in">
        <div :key="String(isPasskeyLoading)">
          <!-- 用户名密码登录 -->
          <v-form ref="loginForm" @submit.prevent="login">
            <v-text-field
              v-model="username"
              label="用户名"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              v-bind="usernameProps"
            />

            <v-text-field
              v-model="password"
              label="密码"
              type="password"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              v-bind="passwordProps"
            />

            <div class="d-flex justify-space-between align-center mb-4">
              <v-checkbox v-model="agree" density="compact" class="flex-grow-0" hide-details="auto" v-bind="agreeProps">
                <template #label>
                  <span class="text-caption">
                    同意<a href="#" class="text-primary">用户协议</a>和<a href="#" class="text-primary">隐私政策</a>
                  </span>
                </template>
              </v-checkbox>
              <v-btn variant="text" color="primary" to="recover/password" size="small">找回密码</v-btn>
            </div>

            <v-btn block color="primary" size="large" type="submit" :loading="isSubmitting"> 立即登录 </v-btn>

            <div class="text-center mt-2">
              <v-btn variant="text" color="primary" to="signup" size="small">没有账号？立即注册</v-btn>
            </div>
          </v-form>

          <!-- 分割线 -->
          <div class="d-flex align-center my-4">
            <v-divider />
            <span class="px-4 text-caption text-medium-emphasis">或</span>
            <v-divider />
          </div>

          <!-- 通行密钥登录 -->
          <v-btn
            block
            color="primary"
            variant="tonal"
            size="large"
            :loading="isPasskeyLoading"
            :disabled="!webAuthnSupported"
            @click="handlePasskeyLogin"
          >
            <v-icon start icon="mdi-key-chain" />
            使用通行密钥登录
          </v-btn>
          <div v-if="!webAuthnSupported" class="text-caption text-medium-emphasis mt-2 text-center">
            当前环境暂不支持通行密钥
          </div>
        </div>
      </v-fade-transition>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { startAuthentication } from '@simplewebauthn/browser'
import { browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { toTypedSchema } from '@vee-validate/zod'
import * as srp from 'secure-remote-password/client'
import * as srpParams from 'secure-remote-password/lib/params'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'

import { UserApi } from '@/network/api/users'
import { ServerError } from '@/network/types/error'
import AccountService from '@/services/account'

const router = useRouter()
const route = useRoute()

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      username: z.string().min(4).max(16),
      password: z.string().min(8),
      agree: z.boolean().refine((v) => v, {
        message: '请同意用户协议和隐私政策',
      }),
    })
  ),
})

const [username, usernameProps] = defineField('username', vuetifyConfig)
const [password, passwordProps] = defineField('password', vuetifyConfig)
const [agree, agreeProps] = defineField('agree', vuetifyConfig)

const errorMessage = ref('')
const isPasskeyLoading = ref(false)
const webAuthnSupported = ref(browserSupportsWebAuthn())

// 如果 URL 中有 username 参数，自动填充用户名
if (route.query.username) {
  username.value = route.query.username as string
}

const login = handleSubmit(async (value) => {
  try {
    // 1. 首先检查用户支持的认证方法
    const authMethodsResponse = await UserApi.getAuthMethods(value.username)
    const authMethods = authMethodsResponse.data

    if (authMethods.supports_srp) {
      // 使用 SRP 流程
      // 1. 生成客户端临时值对
      const clientEphemeral = srp.generateEphemeral()

      // 2. 发送用户名和客户端公开临时值到服务器
      const srpInitResponse = await UserApi.srpInit({
        username: value.username,
        clientPublicEphemeral: clientEphemeral.public,
      })
      const { salt, serverPublicEphemeral } = srpInitResponse.data

      // 3. 使用服务器返回的盐值和临时值生成会话密钥和证明
      const privateKey = srp.derivePrivateKey(salt, value.username, value.password)
      const clientSession = srp.deriveSession(
        clientEphemeral.secret,
        serverPublicEphemeral,
        salt,
        value.username,
        privateKey
      )

      // 4. 发送客户端证明到服务器
      const srpVerifyResponse = await UserApi.srpVerify({
        username: value.username,
        clientPublicEphemeral: clientEphemeral.public,
        clientProof: clientSession.proof,
      })
      const { serverProof, accessToken, requires2FA, tempToken, user } = srpVerifyResponse.data

      // 5. 验证服务器证明
      srp.verifySession(clientEphemeral.public, clientSession, serverProof)

      // 处理登录结果
      if (requires2FA) {
        router.push({
          name: 'Verify2FA',
          query: { token: tempToken },
        })
        return
      }

      AccountService.login(accessToken!, user!)
      toast.success('登录成功')
      router.replace('/')
    } else {
      // 使用传统登录流程
      const { data } = await UserApi.login(value)
      if (data.requires2FA) {
        router.push({
          name: 'Verify2FA',
          query: { token: data.tempToken },
        })
        return
      }
      AccountService.login(data.accessToken!, data.user!)
      toast.success('登录成功')
      router.replace('/')
    }
  } catch (e) {
    if (e instanceof ServerError) {
      toast.error(e.message)
    } else {
      console.error('登录失败:', e)
      toast.error('登录失败，请重试')
    }
  }
})

// 处理通行密钥登录
const handlePasskeyLogin = async () => {
  if (!browserSupportsWebAuthn()) {
    toast.error('当前浏览器不支持通行密钥')
    return
  }

  isPasskeyLoading.value = true
  try {
    // 1. 获取认证选项
    const optionsResponse = await UserApi.getPasskeyAuthenticationOptions()
    const optionsJSON = optionsResponse.data.options

    // 2. 开始认证流程
    const asseResp = await startAuthentication({ optionsJSON })

    // 3. 验证认证结果
    const { data } = await UserApi.verifyPasskeyAuthentication(asseResp)

    // 4. 处理登录成功
    AccountService.login(data.accessToken!, data.user!)
    toast.success('登录成功')
    router.replace('/')
  } catch (error: any) {
    console.error('通行密钥登录失败:', error)

    if (error.name === 'NotAllowedError') {
      toast.error('操作已取消')
    } else if (error.response?.data?.code === 'PASSKEY_NOT_FOUND') {
      toast.error('未找到匹配的通行密钥')
    } else {
      toast.error(error.message || '通行密钥登录失败')
    }
  } finally {
    isPasskeyLoading.value = false
  }
}
</script>
