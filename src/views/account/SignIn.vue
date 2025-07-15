<template>
  <div>
    <!-- 标题区域 - 美观大气 -->
    <div class="mb-12">
      <h1 class="text-h3 font-weight-light mb-3" style="color: #212121; line-height: 1.2">登录</h1>
      <p class="text-body-1" style="color: #757575; line-height: 1.5">欢迎回到知是社区</p>
    </div>

    <!-- 错误/成功提示区域 -->
    <div v-if="errorMessage || route.query.message" class="mb-8">
      <v-alert v-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mb-4">
        {{ errorMessage }}
      </v-alert>
      <v-alert v-if="route.query.message" type="success" variant="tonal" density="comfortable">
        {{ route.query.message }}
      </v-alert>
    </div>

    <v-fade-transition mode="out-in">
      <div :key="String(isPasskeyLoading)">
        <!-- 主要登录表单区域 -->
        <div class="mb-10">
          <v-form ref="loginForm" @submit.prevent="login">
            <!-- 表单字段组 - 预留错误提示空间 -->
            <div class="mb-4">
              <v-text-field v-model="username" label="用户名" variant="outlined" v-bind="usernameProps" class="mb-4" />

              <v-text-field v-model="password" label="密码" type="password" variant="outlined" v-bind="passwordProps" />
            </div>

            <!-- 功能选项行 -->
            <div class="mb-6">
              <div class="d-flex justify-space-between align-center">
                <v-checkbox v-model="agree" density="compact" v-bind="agreeProps" hide-details>
                  <template #label>
                    <span class="text-body-2" style="color: #616161; line-height: 1.4">
                      同意<a href="#" class="text-primary text-decoration-none ml-1">用户协议</a>和<a
                        href="#"
                        class="text-primary text-decoration-none"
                        >隐私政策</a
                      >
                    </span>
                  </template>
                </v-checkbox>
                <v-btn variant="text" color="primary" to="recover/password" size="small" style="text-transform: none">
                  找回密码
                </v-btn>
              </div>
            </div>

            <!-- 主要操作按钮 -->
            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="isSubmitting"
              style="text-transform: none; font-weight: 500; height: 48px"
              class="mb-4"
            >
              立即登录
            </v-btn>

            <!-- 注册链接 - 自然文本流 -->
            <p class="text-body-2" style="color: #757575">
              还没有账号？<v-btn
                variant="text"
                color="primary"
                to="signup"
                size="small"
                style="text-transform: none; padding: 0; min-width: auto; height: auto; vertical-align: baseline"
                class="text-decoration-none"
                >立即注册</v-btn
              >
            </p>
          </v-form>
        </div>

        <!-- 替代登录方式区域 -->
        <div>
          <!-- 优雅的分割线 -->
          <div class="d-flex align-center mb-6">
            <v-divider class="flex-grow-1" />
            <span class="px-4 text-body-2" style="color: #9e9e9e">或</span>
            <v-divider class="flex-grow-1" />
          </div>

          <!-- 通行密钥登录 -->
          <div class="mb-6">
            <v-btn
              block
              color="primary"
              variant="outlined"
              size="large"
              :loading="isPasskeyLoading"
              :disabled="!webAuthnSupported"
              style="text-transform: none; font-weight: 500; height: 48px"
              @click="handlePasskeyLogin"
            >
              <v-icon start icon="mdi-key-chain" size="20" />
              通行密钥登录
            </v-btn>
            <p v-if="!webAuthnSupported" class="text-body-2 mt-2" style="color: #9e9e9e">当前环境暂不支持通行密钥</p>
          </div>

          <!-- 第三方登录 -->
          <div v-if="oAuthProviders.length > 0">
            <div class="text-body-1 font-weight-medium mb-4" style="color: #424242">第三方登录</div>
            <div class="d-flex flex-column" style="gap: 12px">
              <v-btn
                v-for="provider in oAuthProviders"
                :key="provider.id"
                block
                variant="outlined"
                size="large"
                :loading="oAuthLoading === provider.id"
                style="
                  text-transform: none;
                  font-weight: 500;
                  height: 48px;
                  border-color: #e0e0e0;
                  justify-content: flex-start;
                  padding-left: 16px;
                "
                @click="handleOAuthLogin(provider.id)"
              >
                <v-icon start :icon="getProviderIcon(provider.id)" size="20" />
                {{ provider.name }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-fade-transition>
  </div>
</template>

<script lang="ts" setup>
import type { OAuthProvider } from '@/network/api/users/types'

import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { startAuthentication } from '@simplewebauthn/browser'
import { browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { toTypedSchema } from '@vee-validate/zod'
import * as srp from 'secure-remote-password/client'
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
const oAuthProviders = ref<OAuthProvider[]>([])
const oAuthLoading = ref<string | null>(null)

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

// 获取 OAuth 提供商
const fetchOAuthProviders = async () => {
  try {
    const response = await UserApi.getOAuthProviders()
    oAuthProviders.value = response.data.providers
  } catch (error) {
    console.error('获取 OAuth 提供商失败:', error)
  }
}

// 处理 OAuth 登录
const handleOAuthLogin = async (providerId: string) => {
  oAuthLoading.value = providerId
  try {
    // 生成随机 state 参数用于防止 CSRF 攻击
    const state = crypto.randomUUID()

    // 将 state 存储到 localStorage，用于后续验证
    localStorage.setItem('oauth_state', state)

    // 跳转到 OAuth 登录页面
    UserApi.redirectToOAuthLogin(providerId, state)
  } catch (error) {
    oAuthLoading.value = null
    console.error('OAuth 登录失败:', error)
    toast.error('OAuth 登录失败')
  }
}

// 获取提供商图标
const getProviderIcon = (providerId: string) => {
  const iconMap: Record<string, string> = {
    github: 'mdi-github',
    google: 'mdi-google',
    microsoft: 'mdi-microsoft',
    qq: 'mdi-qqchat',
    wechat: 'mdi-wechat',
    weibo: 'mdi-sina-weibo',
  }
  return iconMap[providerId] || 'mdi-account-circle'
}

onMounted(() => {
  fetchOAuthProviders()
})
</script>
