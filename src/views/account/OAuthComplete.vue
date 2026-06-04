<template>
  <div>
    <!-- 标题和用户信息结合区域 -->
    <div class="mb-12">
      <div class="d-flex align-center mb-4">
        <v-avatar size="48" color="primary" class="me-4">
          <span class="text-h6">{{ oauthState ? getInitials(oauthState.userInfo.name) : '' }}</span>
        </v-avatar>
        <div>
          <h1 class="text-h3 font-weight-light mb-1" style="color: #212121; line-height: 1.2">
            欢迎，{{ oauthState?.userInfo.name || '用户' }}
          </h1>
          <p class="text-body-1" style="color: #757575; line-height: 1.5">
            您已通过 {{ providerDisplayName }} 授权，请选择如何继续
          </p>
        </div>
      </div>
      <div v-if="oauthState?.userInfo.email || oauthState?.userInfo.preferredUsername" class="ml-16">
        <p class="text-body-2" style="color: #9e9e9e">
          {{ oauthState.userInfo.email || oauthState.userInfo.preferredUsername }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="text-body-2 mt-4 text-medium-emphasis">正在获取账户信息...</div>
    </div>

    <!-- Main Content -->
    <div v-else-if="oauthState">
      <!-- 选项选择 - 并排卡片 -->
      <div class="mb-8">
        <div class="d-flex flex-column flex-sm-row gap-4">
          <!-- 创建新账户 -->
          <v-card
            variant="outlined"
            :class="{ 'selected-card': selectedOption === 'create' }"
            class="flex-1 option-card"
            @click="selectedOption = 'create'"
          >
            <v-card-text class="text-center pa-6">
              <v-icon size="32" color="primary" class="mb-3">mdi-account-plus</v-icon>
              <div class="text-subtitle-1 font-weight-medium mb-2">创建新账户</div>
              <div class="text-body-2 text-medium-emphasis">使用当前信息创建新账户</div>
            </v-card-text>
          </v-card>

          <!-- 绑定现有账户 -->
          <v-card
            variant="outlined"
            :class="{ 'selected-card': selectedOption === 'bind' }"
            class="flex-1 option-card"
            @click="selectedOption = 'bind'"
          >
            <v-card-text class="text-center pa-6">
              <v-icon size="32" color="primary" class="mb-3">mdi-link-variant</v-icon>
              <div class="text-subtitle-1 font-weight-medium mb-2">绑定现有账户</div>
              <div class="text-body-2 text-medium-emphasis">绑定到已有的账户</div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- 创建账户表单 -->
      <div v-if="selectedOption === 'create'">
        <v-form ref="createFormRef" @submit.prevent="handleCreateAccount">
          <div class="mb-4">
            <v-text-field
              v-model="createUsername"
              label="用户名"
              variant="outlined"
              :rules="usernameRules"
              class="mb-4"
              hint="3-20个字符，字母开头，可包含字母、数字、下划线、连字符"
              persistent-hint
            />

            <v-text-field
              v-model="createNickname"
              label="昵称"
              variant="outlined"
              :rules="nicknameRules"
              class="mb-4"
              hint="1-50个字符，显示名称"
              persistent-hint
            />

            <!-- 密码选项 -->
            <div class="mb-4">
              <v-checkbox v-model="setPassword" density="compact" hide-details>
                <template #label>
                  <span class="text-body-2" style="color: #616161">为账户设置密码（推荐）</span>
                </template>
              </v-checkbox>
              <p class="text-body-2 mt-2" style="color: #9e9e9e">
                设置密码后可以使用用户名密码登录，不设置则只能通过第三方登录
              </p>
            </div>

            <!-- 密码输入字段 -->
            <div v-if="setPassword" class="mb-4">
              <v-text-field
                v-model="createPassword"
                label="密码"
                type="password"
                variant="outlined"
                :rules="passwordRules"
                class="mb-4"
                hint="至少8个字符"
                persistent-hint
              />

              <v-text-field
                v-model="confirmPassword"
                label="确认密码"
                type="password"
                variant="outlined"
                :rules="confirmPasswordRules"
                hint="请再次输入密码"
                persistent-hint
              />
            </div>
          </div>

          <v-btn
            type="submit"
            block
            color="primary"
            size="large"
            :loading="creating"
            style="text-transform: none; font-weight: 500; height: 48px"
            class="mb-4"
          >
            创建账户
          </v-btn>
        </v-form>
      </div>

      <!-- 绑定账户表单 -->
      <div v-if="selectedOption === 'bind'">
        <v-form ref="bindFormRef" @submit.prevent="handleBindAccount">
          <div class="mb-4">
            <v-text-field
              v-model="bindUsername"
              label="用户名"
              variant="outlined"
              :rules="usernameRules"
              class="mb-4"
              @input="debouncedCheckAuthMethods(bindUsername)"
            />

            <v-text-field
              v-model="bindPassword"
              label="密码"
              type="password"
              variant="outlined"
              :rules="passwordRules"
            />
          </div>

          <v-btn
            type="submit"
            block
            color="primary"
            size="large"
            :loading="binding"
            style="text-transform: none; font-weight: 500; height: 48px"
            class="mb-4"
          >
            绑定账户
          </v-btn>
        </v-form>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="mb-6">
        <v-alert type="error" variant="tonal" density="comfortable">
          {{ error }}
        </v-alert>
      </div>

      <!-- 底部链接 -->
      <p class="text-body-2 text-center" style="color: #757575">
        遇到问题？<v-btn
          variant="text"
          color="primary"
          to="/help"
          size="small"
          style="text-transform: none; padding: 0; min-width: auto; height: auto; vertical-align: baseline"
          class="text-decoration-none ml-1"
          >联系支持</v-btn
        >
      </p>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-8">
      <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h2 class="text-h6 mb-2">无法获取账户信息</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ error || '状态令牌无效或已过期' }}</p>
      <v-btn color="primary" variant="outlined" :to="{ name: 'SignIn' }" style="text-transform: none"> 返回登录 </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OAuthState } from '@/network/api/users/types'

import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { debounce } from 'lodash-es'

import { UserApi } from '@/network/api/users'

const route = useRoute()

const loading = ref(true)
const error = ref('')
const oauthState = ref<OAuthState | null>(null)
const selectedOption = ref<'create' | 'bind'>('create')
const creating = ref(false)
const binding = ref(false)

// Create form fields
const createUsername = ref('')
const createNickname = ref('')
const setPassword = ref(false)
const createPassword = ref('')
const confirmPassword = ref('')

// Bind form fields
const bindUsername = ref('')
const bindPassword = ref('')
const bindAuthMethods = ref<{
  supports_srp: boolean
  supports_passkey: boolean
  supports_2fa: boolean
  requires_2fa: boolean
} | null>(null)

// Form refs
const createFormRef = ref()
const bindFormRef = ref()

// Validation rules
const usernameRules = [
  (v: string) => !!v || '请输入用户名',
  (v: string) => /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/.test(v) || '用户名格式不正确',
]

const nicknameRules = [
  (v: string) => !!v || '请输入昵称',
  (v: string) => (v.length >= 1 && v.length <= 50) || '昵称长度应为1-50个字符',
]

const passwordRules = [(v: string) => !!v || '请输入密码', (v: string) => v.length >= 8 || '密码长度应至少8个字符']

const confirmPasswordRules = [
  (v: string) => !!v || '请确认密码',
  (v: string) => v === createPassword.value || '两次输入的密码不一致',
]

// Computed
const providerDisplayName = computed(() => {
  if (!oauthState.value) return ''
  const providerMap: Record<string, string> = {
    github: 'GitHub',
    google: 'Google',
    ruc: '微人大认证',
    microsoft: 'Microsoft',
  }
  return providerMap[oauthState.value.providerId] || oauthState.value.providerId
})

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Check authentication methods for bind username (internal use only)
const checkBindAuthMethods = async (username: string) => {
  if (!username) {
    bindAuthMethods.value = null
    return
  }

  try {
    const response = await UserApi.getAuthMethods(username)
    bindAuthMethods.value = response.data
  } catch (err: any) {
    console.error('获取认证方式失败:', err)
    bindAuthMethods.value = null
    // 静默处理，不显示错误
  }
}

// 使用 debounce 包装检查函数
const debouncedCheckAuthMethods = debounce(checkBindAuthMethods, 500)

const handleCreateAccount = async () => {
  if (!createFormRef.value) return
  const { valid } = await createFormRef.value.validate()
  if (!valid || !oauthState.value) return

  creating.value = true
  error.value = ''

  try {
    const stateToken = route.query.stateToken as string
    let requestData: any = {
      stateToken,
      username: createUsername.value,
      nickname: createNickname.value,
      passwordMode: setPassword.value ? 'srp' : 'none',
    }

    // 如果用户选择设置密码，生成 SRP 凭证
    if (setPassword.value && createPassword.value) {
      const srp = await import('secure-remote-password/client')
      const salt = srp.generateSalt()
      const privateKey = srp.derivePrivateKey(salt, createUsername.value, createPassword.value)
      const verifier = srp.deriveVerifier(privateKey)

      requestData.srpSalt = salt
      requestData.srpVerifier = verifier
    }

    // 直接提交表单，后端会重定向到成功或错误页面
    UserApi.createUserFromOAuth(requestData)
  } catch (err: any) {
    console.error('创建账户失败:', err)
    error.value = '创建账户失败，请重试'
    creating.value = false
  }
}

const handleBindAccount = async () => {
  if (!bindFormRef.value) return
  const { valid } = await bindFormRef.value.validate()
  if (!valid || !oauthState.value) return

  binding.value = true
  error.value = ''

  try {
    const stateToken = route.query.stateToken as string

    if (bindAuthMethods.value?.supports_srp) {
      // 使用 SRP 流程
      await handleSrpBind(stateToken)
    } else {
      // 使用传统密码验证
      UserApi.bindOAuthToUser({
        stateToken,
        username: bindUsername.value,
        password: bindPassword.value,
      })
    }
  } catch (err: any) {
    console.error('绑定账户失败:', err)
    error.value = '绑定账户失败，请检查用户名和密码'
    binding.value = false
  }
}

const handleSrpBind = async (stateToken: string) => {
  try {
    const srp = await import('secure-remote-password/client')

    // 生成客户端临时值对
    const clientEphemeral = srp.generateEphemeral()

    // 初始化 SRP 绑定
    const initResponse = await UserApi.initOAuthSrpBinding({
      stateToken,
      username: bindUsername.value,
      clientPublicEphemeral: clientEphemeral.public,
    })

    console.log(initResponse)

    // 派生私钥和会话密钥
    const privateKey = srp.derivePrivateKey(initResponse.data.salt, bindUsername.value, bindPassword.value)
    const session = srp.deriveSession(
      clientEphemeral.secret,
      initResponse.data.serverPublicEphemeral,
      initResponse.data.salt,
      bindUsername.value,
      privateKey
    )

    // 验证 SRP 绑定（通过表单提交）
    UserApi.verifyOAuthSrpBinding({
      sessionId: initResponse.data.sessionId,
      clientPublicEphemeral: clientEphemeral.public,
      clientProof: session.proof,
    })
    // 后端会重定向，不需要处理响应
  } catch (err: any) {
    console.error('SRP 绑定失败:', err)
    throw err
  }
}

const loadOAuthState = async () => {
  const stateToken = route.query.stateToken as string

  if (!stateToken) {
    error.value = '缺少状态令牌'
    loading.value = false
    return
  }

  try {
    const response = await UserApi.getOAuthState(stateToken)
    oauthState.value = response.data

    // Pre-fill form fields with suggested values
    createUsername.value = response.data.suggestedUsername
    createNickname.value = response.data.suggestedNickname
  } catch (err: any) {
    console.error('获取OAuth状态失败:', err)
    error.value = err.response?.data?.message || '无法获取OAuth状态信息'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOAuthState()
})
</script>

<style scoped>
.option-card {
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 140px;
}

.option-card:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.selected-card {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.04);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.gap-4 {
  gap: 16px;
}
</style>
