<template>
  <div>
    <!-- 标题区域 - 美观大气 -->
    <div class="mb-12">
      <div class="d-flex align-center mb-3">
        <v-icon color="error" size="28" class="mr-3">mdi-alert-circle</v-icon>
        <h1 class="text-h3 font-weight-light" style="color: #212121; line-height: 1.2">登录失败</h1>
      </div>
      <p class="text-body-1" style="color: #757575; line-height: 1.5">使用 {{ providerName }} 登录时发生错误</p>
    </div>

    <!-- 错误信息区域 -->
    <div class="mb-8">
      <v-alert type="error" variant="tonal" density="comfortable">
        <div class="font-weight-medium mb-1">错误信息：</div>
        <div>{{ errorMessage }}</div>
        <div v-if="errorDescription" class="mt-2">
          <div class="font-weight-medium mb-1">详细描述：</div>
          <div>{{ errorDescription }}</div>
        </div>
      </v-alert>
    </div>

    <!-- 操作按钮区域 -->
    <div class="mb-8">
      <v-btn
        block
        color="primary"
        size="large"
        to="/account/signin"
        style="text-transform: none; font-weight: 500; height: 48px"
        class="mb-4"
      >
        <v-icon start size="20">mdi-arrow-left</v-icon>
        返回登录页面
      </v-btn>

      <v-btn
        block
        variant="outlined"
        color="primary"
        style="text-transform: none; font-weight: 500; height: 48px"
        @click="retryOAuth"
      >
        <v-icon start size="20">mdi-refresh</v-icon>
        重试 {{ providerName }} 登录
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { UserApi } from '@/network/api/users'

const route = useRoute()
const router = useRouter()

const errorMessage = ref('')
const errorDescription = ref('')
const providerName = ref('')
const providerId = ref('')

// 获取提供商显示名称
const getProviderName = (providerId: string) => {
  const nameMap: Record<string, string> = {
    github: 'GitHub',
    google: 'Google',
    microsoft: 'Microsoft',
    qq: 'QQ',
    wechat: '微信',
    weibo: '微博',
  }
  return nameMap[providerId] || providerId
}

// 重试 OAuth 登录
const retryOAuth = () => {
  if (providerId.value) {
    const state = crypto.randomUUID()
    localStorage.setItem('oauth_state', state)
    UserApi.redirectToOAuthLogin(providerId.value, state)
  }
}

onMounted(() => {
  const error = route.query.error as string
  const errorCode = route.query.error_code as string
  const provider = route.query.provider as string

  errorMessage.value = error || '未知错误'
  // 根据错误代码提供更详细的描述
  if (errorCode) {
    switch (errorCode) {
      case 'INVALID_PASSWORD':
        errorDescription.value = '密码验证失败，请检查您的密码是否正确'
        break
      case 'INVALID_SRP_PROOF':
        errorDescription.value = 'SRP 安全验证失败，请重新尝试'
        break
      case 'SESSION_EXPIRED':
        errorDescription.value = '验证会话已过期，请重新开始登录流程'
        break
      case 'VERIFICATION_FAILED':
        errorDescription.value = '身份验证失败，请重试或联系技术支持'
        break
      default:
        errorDescription.value = errorCode
    }
  } else {
    errorDescription.value = ''
  }

  providerId.value = provider || ''
  providerName.value = getProviderName(provider)

  // 清理可能存在的 state
  localStorage.removeItem('oauth_state')
})
</script>
