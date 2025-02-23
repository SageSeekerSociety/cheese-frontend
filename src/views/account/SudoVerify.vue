<template>
  <v-card class="mx-auto" max-width="500" rounded="lg">
    <v-card-item
      class="bg-primary text-white"
      prepend-icon="mdi-shield-account"
      title="安全验证"
      subtitle="为保护您的账户安全，请完成身份核验"
    />

    <v-card-text class="pa-6">
      <!-- 错误提示 -->
      <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <!-- 加载状态 -->
      <div v-if="isInitializing" class="d-flex justify-center align-center py-4">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- 动态验证内容 -->
      <v-fade-transition v-else mode="out-in">
        <div :key="activeMethod">
          <!-- 通行密钥 -->
          <div v-if="activeMethod === 'passkey'" class="text-center py-4">
            <v-icon icon="mdi-key-chain" size="64" class="text-primary mb-4" />
            <h3 class="text-h6 mb-2">通行密钥验证</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">使用已注册的安全密钥或生物识别</p>
            <v-btn color="primary" size="large" :loading="loading" @click="handlePasskeyVerify"> 立即验证 </v-btn>
          </div>

          <!-- 密码验证 -->
          <div v-if="activeMethod === 'password'">
            <v-form @submit.prevent="handlePasswordVerify">
              <v-text-field
                v-model="password"
                label="账户密码"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
              />
              <v-btn block color="primary" size="large" type="submit" :loading="loading" class="mt-2"> 验证密码 </v-btn>
            </v-form>
          </div>

          <!-- TOTP验证 -->
          <div v-if="activeMethod === 'totp'">
            <v-form class="text-center" @submit.prevent="handleTOTPVerify">
              <v-otp-input v-model="totpCode" length="6" @input="handleTOTPInput" />
              <v-btn block color="primary" size="large" type="submit" :loading="loading" class="mt-4">
                验证动态码
              </v-btn>
            </v-form>
          </div>
        </div>
      </v-fade-transition>

      <!-- 验证方式切换 -->
      <v-fade-transition>
        <div v-if="!isInitializing && hasAlternativeMethods" class="text-center mt-6">
          <p class="text-caption text-medium-emphasis mb-2">切换验证方式</p>
          <v-list density="compact" class="py-0" bg-color="transparent">
            <template v-for="method in availableMethods" :key="method.id">
              <v-list-item
                v-if="method.visible && method.id !== activeMethod"
                :disabled="loading || method.disabled"
                class="px-0"
                @click="activeMethod = method.id"
              >
                <template #prepend>
                  <v-icon :icon="method.icon" size="small" class="text-medium-emphasis" />
                </template>
                <v-list-item-title class="text-body-2">
                  {{ method.label }}
                </v-list-item-title>
                <template #append>
                  <v-icon icon="mdi-chevron-right" size="small" />
                </template>
              </v-list-item>
            </template>
          </v-list>
        </div>
      </v-fade-transition>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser'
import * as srp from 'secure-remote-password/client'

import { UserApi } from '@/network/api/users'
import AccountService from '@/services/account'
import { currentUserId, currentUserName } from '@/services/account'
import { useSudoStore } from '@/stores/sudo'

const router = useRouter()

const activeMethod = ref('passkey')
const loading = ref(false)
const password = ref('')
const showPassword = ref(false)
const totpCode = ref('')
const errorMessage = ref('')
const webAuthnSupported = ref(false)

// 添加 SRP 相关状态
const srpSession = ref<{
  clientEphemeral?: { secret: string; public: string }
  serverPublicEphemeral?: string
  salt?: string
}>({})

// 在 SudoVerify.vue 中添加认证方法相关的状态
const authMethods = ref<{
  supports_srp: boolean
  supports_passkey: boolean
  supports_2fa: boolean
  requires_2fa: boolean
}>({
  supports_srp: false,
  supports_passkey: false,
  supports_2fa: false,
  requires_2fa: false,
})

const setAccessToken = (token: string) => {
  AccountService.accessToken = token
}

// 添加初始化状态
const isInitializing = ref(true)

// 添加计算属性判断是否有其他可选的验证方式
const hasAlternativeMethods = computed(() => {
  return availableMethods.value.some((method) => method.visible && method.id !== activeMethod.value)
})

// 通行密钥验证
const handlePasskeyVerify = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    // 获取验证选项
    const optionsResponse = await UserApi.getPasskeyAuthenticationOptions(currentUserId.value)
    const optionsJSON = optionsResponse.data.options

    // 开始验证
    const asseResp = await startAuthentication({ optionsJSON })

    // 验证结果
    const response = await UserApi.verifySudoPasskey(asseResp)

    // 更新 access token
    setAccessToken(response.data.accessToken)

    // 验证成功，返回原页面
    await handleVerifySuccess()
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      errorMessage.value = '操作被取消'
    } else {
      errorMessage.value = error.message || '验证失败'
    }
  } finally {
    loading.value = false
  }
}

// 密码验证
const handlePasswordVerify = async () => {
  if (!password.value || !currentUserName.value) {
    errorMessage.value = '请输入密码'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    // 先获取认证方法
    const methodsResponse = await UserApi.getAuthMethods(currentUserName.value)
    const methods = methodsResponse.data

    if (methods.supports_srp) {
      // 使用 SRP 流程
      // 1. 生成客户端临时值对
      srpSession.value.clientEphemeral = srp.generateEphemeral()

      // 2. 发送用户名和客户端公开临时值到服务器
      const initResponse = await UserApi.verifySudoSrpInit({
        clientPublicEphemeral: srpSession.value.clientEphemeral.public,
      })

      const { salt, serverPublicEphemeral } = initResponse.data
      srpSession.value.salt = salt
      srpSession.value.serverPublicEphemeral = serverPublicEphemeral

      // 3. 使用服务器返回的盐值和临时值生成会话密钥和证明
      const privateKey = srp.derivePrivateKey(salt, currentUserName.value, password.value)
      const clientSession = srp.deriveSession(
        srpSession.value.clientEphemeral.secret,
        serverPublicEphemeral,
        salt,
        currentUserName.value,
        privateKey
      )

      // 4. 发送客户端证明到服务器
      const verifyResponse = await UserApi.verifySudoSrpVerify({
        clientProof: clientSession.proof,
      })

      const { serverProof, accessToken } = verifyResponse.data

      // 5. 验证服务器证明
      srp.verifySession(srpSession.value.clientEphemeral.public, clientSession, serverProof)

      // 6. 更新 access token 并完成验证
      setAccessToken(accessToken)
      await handleVerifySuccess()
    } else {
      // 使用传统密码验证
      const response = await UserApi.verifySudoPassword(password.value)

      // 如果服务器返回了 srpUpgraded = true，说明账户已自动升级到 SRP
      if (response.data.srpUpgraded) {
        toast.success('您的账户安全性已自动升级')
      }

      // 更新 access token
      setAccessToken(response.data.accessToken)
      await handleVerifySuccess()
    }
  } catch (error: any) {
    errorMessage.value = error.message || '验证失败'
  } finally {
    loading.value = false
  }
}

// TOTP 验证
const handleTOTPVerify = async () => {
  if (!totpCode.value) {
    errorMessage.value = '请输入验证码'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const response = await UserApi.verifySudoTOTP(totpCode.value)

    // 更新 access token
    setAccessToken(response.data.accessToken)

    // 验证成功，返回原页面
    await handleVerifySuccess()
  } catch (error: any) {
    errorMessage.value = error.message || '验证失败'
  } finally {
    loading.value = false
  }
}

// TOTP 输入处理
const handleTOTPInput = (value: string) => {
  if (value.length === 6) {
    handleTOTPVerify()
  }
}

// 验证成功后的处理
const handleVerifySuccess = async () => {
  const sudoStore = useSudoStore()
  // 设置验证成功标志
  sudoStore.setVerified()

  if (sudoStore.returnPath) {
    router.replace(sudoStore.returnPath)
  } else {
    router.replace('/')
  }
}

// 修改 availableMethods 计算属性
const availableMethods = computed(() => [
  {
    id: 'passkey',
    label: '使用通行密钥验证',
    icon: 'mdi-key-chain',
    visible: webAuthnSupported.value && authMethods.value.supports_passkey,
    disabled: false,
  },
  {
    id: 'password',
    label: '使用账户密码验证',
    icon: 'mdi-form-textbox-password',
    visible: true,
    disabled: false,
  },
  {
    id: 'totp',
    label: '使用动态验证码',
    icon: 'mdi-clock-outline',
    visible: authMethods.value.supports_2fa,
    disabled: false,
  },
])

// 修改 onMounted
onMounted(async () => {
  try {
    webAuthnSupported.value = browserSupportsWebAuthn()

    // 获取认证方法
    if (currentUserName.value) {
      const response = await UserApi.getAuthMethods(currentUserName.value)
      authMethods.value = response.data

      // 根据认证方法设置默认验证方式
      if (webAuthnSupported.value && authMethods.value.supports_passkey) {
        activeMethod.value = 'passkey'
      } else if (authMethods.value.supports_2fa) {
        activeMethod.value = 'totp'
      } else {
        activeMethod.value = 'password'
      }
    }
  } catch (error) {
    console.error('获取认证方法失败:', error)
    // 如果获取失败，默认使用密码验证
    activeMethod.value = 'password'
  } finally {
    isInitializing.value = false
  }
})
</script>
