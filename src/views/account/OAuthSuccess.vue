<template>
  <div>
    <!-- 标题区域 - 简约设计 -->
    <div class="mb-10">
      <div class="d-flex align-center mb-3">
        <v-icon color="success" size="28" class="mr-3">mdi-check-circle</v-icon>
        <h1 class="text-h3 font-weight-light" style="color: #212121">登录成功</h1>
      </div>

      <template v-if="processing">
        <p class="text-body-1 font-weight-regular mb-8" style="color: #757575">
          欢迎使用 {{ providerName }} 登录，正在处理登录信息...
        </p>

        <v-progress-linear indeterminate color="primary" height="2" class="mb-4" />
      </template>

      <template v-else-if="!error">
        <p class="text-body-1 font-weight-regular mb-8" style="color: #757575">登录成功，正在跳转到主页...</p>

        <v-progress-linear indeterminate color="primary" height="2" class="mb-4" />
      </template>

      <template v-if="error">
        <v-alert type="error" variant="tonal" class="mb-8">
          {{ error }}
        </v-alert>

        <v-btn color="primary" size="large" to="/account/signin" style="text-transform: none; font-weight: 500">
          返回登录
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'

import AccountService from '@/services/account'

const route = useRoute()
const router = useRouter()

const processing = ref(true)
const error = ref('')
const providerName = ref('')

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

onMounted(async () => {
  try {
    const token = route.query.token as string
    const email = route.query.email as string
    const linked = route.query.linked as string
    const provider = route.query.provider as string

    if (!token) {
      throw new Error('缺少登录令牌')
    }

    // 根据 provider 参数获取显示名称，如果没有则从邮箱推断
    if (provider) {
      providerName.value = getProviderName(provider)
    } else if (email) {
      // 从邮箱域名推断提供商
      const domain = email.split('@')[1]
      if (domain === 'gmail.com') {
        providerName.value = 'Google'
      } else if (domain === 'outlook.com' || domain === 'hotmail.com') {
        providerName.value = 'Microsoft'
      } else {
        providerName.value = 'OAuth'
      }
    } else {
      providerName.value = 'OAuth'
    }

    // 验证 state 参数（如果有的话）
    const storedState = localStorage.getItem('oauth_state')
    if (storedState) {
      localStorage.removeItem('oauth_state')
      // 这里可以根据需要验证 state 参数
    }

    // 直接使用 token 登录，login 方法会自动获取完整的用户信息
    await AccountService.login(token)

    processing.value = false

    // 根据是否为绑定操作显示不同的成功消息
    if (linked === 'true') {
      toast.success(`${providerName.value} 账户绑定成功！`)
    } else {
      toast.success(`使用 ${providerName.value} 登录成功！`)
    }

    // 延迟跳转到主页
    setTimeout(() => {
      router.replace('/')
    }, 1500)
  } catch (err) {
    processing.value = false
    error.value = err instanceof Error ? err.message : '登录处理失败'
    console.error('OAuth 登录成功处理失败:', err)
  }
})
</script>
