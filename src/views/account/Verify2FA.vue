<template>
  <div>
    <!-- 标题区域 - 美观大气 -->
    <div class="mb-12">
      <div class="d-flex align-center mb-3">
        <v-icon color="primary" size="28" class="mr-3">mdi-two-factor-authentication</v-icon>
        <h1 class="text-h3 font-weight-light" style="color: #212121; line-height: 1.2">两步验证</h1>
      </div>
      <p class="text-body-1" style="color: #757575; line-height: 1.5">请输入您的验证信息</p>
    </div>

    <!-- 错误提示区域 -->
    <div v-if="errorMessage" class="mb-8">
      <v-alert type="error" variant="tonal" density="comfortable">
        {{ errorMessage }}
      </v-alert>
    </div>

    <v-fade-transition mode="out-in">
      <div :key="String(showBackupCodeDialog)">
        <!-- 主验证表单区域 -->
        <div class="mb-8">
          <v-form @submit.prevent="handleVerify">
            <!-- 验证码输入说明 -->
            <div class="mb-6">
              <p class="text-body-1 font-weight-medium mb-2" style="color: #424242">
                {{ codeType === 'totp' ? '输入动态验证码' : '输入备用验证码' }}
              </p>
              <p class="text-body-2" style="color: #757575">
                {{
                  codeType === 'totp'
                    ? '请打开您的身份验证器应用，输入6位数字验证码'
                    : '请输入8位字母数字组合的备用验证码'
                }}
              </p>
            </div>

            <!-- OTP 输入区域 -->
            <div class="mb-6">
              <v-otp-input
                v-if="codeType === 'totp'"
                v-model="totpCode"
                length="6"
                type="number"
                variant="outlined"
                @update:model-value="handleTOTPInput"
              />

              <v-otp-input
                v-else
                v-model="backupCode"
                length="8"
                type="text"
                variant="outlined"
                :rules="[(v: string) => /^[a-zA-Z0-9]{8}$/.test(v) || '必须是8位字母数字组合']"
                @update:model-value="handleBackupInput"
              />
            </div>

            <!-- 验证按钮 -->
            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="loading"
              :disabled="!validateCode(codeType === 'totp' ? totpCode : backupCode)"
              style="text-transform: none; font-weight: 500; height: 48px"
              class="mb-6"
            >
              验证{{ codeType === 'totp' ? '动态码' : '备用码' }}
            </v-btn>

            <!-- 切换验证方式 -->
            <p class="text-body-2" style="color: #757575">
              {{ codeType === 'totp' ? '无法获取验证码？' : '想使用动态验证码？' }}
              <v-btn
                variant="text"
                color="primary"
                size="small"
                style="text-transform: none; padding: 0; min-width: auto; height: auto; vertical-align: baseline"
                class="text-decoration-none"
                @click="toggleCodeType"
              >
                {{ codeType === 'totp' ? '使用备用码' : '使用动态码' }}
              </v-btn>
            </p>
          </v-form>
        </div>

        <!-- 备用码使用提醒对话框 -->
        <v-dialog v-model="showBackupCodeDialog" max-width="400">
          <v-card>
            <v-card-item prepend-icon="mdi-alert" title="备用码已使用" class="bg-warning-container" />
            <v-card-text class="pt-4"> 您已使用备用验证码，建议及时生成新备用码以确保账户安全。 </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn variant="text" style="text-transform: none" @click="handleLater">稍后处理</v-btn>
              <v-btn color="primary" style="text-transform: none" @click="handleGoToSecurity">立即更新</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'

import { UserApi } from '@/network/api/users'
import AccountService from '@/services/account'

const router = useRouter()
const route = useRoute()

const codeType = ref<'totp' | 'backup'>('totp')
const totpCode = ref('')
const backupCode = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showBackupCodeDialog = ref(false)

const handleVerify = async () => {
  const code = codeType.value === 'totp' ? totpCode.value : backupCode.value

  if (!validateCode(code)) {
    errorMessage.value = codeType.value === 'totp' ? '请输入6位数字验证码' : '请输入8位字母数字备用码'
    return
  }

  const token = route.query.token as string
  if (!token) {
    router.replace({ name: 'SignIn' })
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await UserApi.verify2FA({
      temp_token: token,
      code: code,
    })

    // 登录成功
    AccountService.login(data.accessToken!, data.user!)
    toast.success('登录成功')

    // 如果使用了备用码，显示提醒对话框
    if (data.usedBackupCode) {
      showBackupCodeDialog.value = true
    } else {
      router.replace('/')
    }
  } catch (error: any) {
    errorMessage.value = error.message || '验证失败'
  } finally {
    loading.value = false
  }
}

const validateCode = (code: string) => {
  if (codeType.value === 'totp') {
    return /^\d{6}$/.test(code)
  }
  return /^[a-zA-Z0-9]{8}$/.test(code)
}

const handleTOTPInput = (value: string) => {
  backupCode.value = ''
  if (value.length === 6) {
    handleVerify()
  }
}

const handleBackupInput = (value: string) => {
  totpCode.value = ''
  if (value.length === 8) {
    handleVerify()
  }
}

const toggleCodeType = () => {
  codeType.value = codeType.value === 'totp' ? 'backup' : 'totp'
  totpCode.value = ''
  backupCode.value = ''
  errorMessage.value = ''
}

const handleGoToSecurity = () => {
  showBackupCodeDialog.value = false
  router.push({ name: 'UserSettingsSecurity' })
}

const handleLater = () => {
  showBackupCodeDialog.value = false
  router.replace('/')
}

onMounted(() => {
  if (!route.query.token) {
    router.replace({ name: 'SignIn' })
  }
})
</script>
