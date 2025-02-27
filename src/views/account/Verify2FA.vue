<template>
  <v-card class="mx-auto" max-width="500" rounded="lg">
    <v-card-item
      class="bg-primary text-white"
      prepend-icon="mdi-two-factor-authentication"
      title="两步验证"
      subtitle="请输入您的验证信息"
    />

    <v-card-text class="pa-6">
      <v-fade-transition mode="out-in">
        <div :key="String(showBackupCodeDialog)">
          <!-- 主验证表单 -->
          <v-form @submit.prevent="handleVerify">
            <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4">
              {{ errorMessage }}
            </v-alert>

            <div class="text-center">
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

              <div class="d-flex justify-center gap-2 mt-4">
                <v-btn variant="tonal" color="primary" size="small" @click="toggleCodeType">
                  {{ codeType === 'totp' ? '使用备用码' : '使用动态码' }}
                </v-btn>
              </div>

              <v-btn
                color="primary"
                size="large"
                class="mt-6"
                type="submit"
                :loading="loading"
                :disabled="!validateCode(codeType === 'totp' ? totpCode : backupCode)"
              >
                验证{{ codeType === 'totp' ? '动态码' : '备用码' }}
              </v-btn>
            </div>
          </v-form>

          <!-- 备用码使用提醒 -->
          <v-dialog v-model="showBackupCodeDialog" max-width="400">
            <v-card>
              <v-card-item prepend-icon="mdi-alert" title="备用码已使用" class="bg-warning-container" />
              <v-card-text class="pt-4"> 您已使用备用验证码，建议及时生成新备用码以确保账户安全。 </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn variant="text" @click="handleLater">稍后处理</v-btn>
                <v-btn color="primary" @click="handleGoToSecurity">立即更新</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-fade-transition>
    </v-card-text>
  </v-card>
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
