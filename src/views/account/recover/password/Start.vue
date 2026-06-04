<template>
  <div>
    <!-- 标题区域 - 美观大气 -->
    <div class="mb-12">
      <div class="d-flex align-center mb-3">
        <v-icon color="primary" size="28" class="mr-3">mdi-lock-reset</v-icon>
        <h1 class="text-h3 font-weight-light" style="color: #212121; line-height: 1.2">重置账户密码</h1>
      </div>
      <p class="text-body-1" style="color: #757575; line-height: 1.5">通过注册邮箱验证身份</p>
    </div>

    <!-- 错误/成功提示区域 -->
    <div v-if="myAlert.message" class="mb-8">
      <v-alert :type="myAlert.type" variant="tonal" density="comfortable">
        {{ myAlert.message }}
      </v-alert>
    </div>

    <v-fade-transition mode="out-in">
      <div :key="String(isSubmitting)">
        <!-- 重置表单区域 -->
        <div class="mb-8">
          <v-form @submit.prevent="submit">
            <v-text-field
              v-model="email"
              label="注册邮箱"
              variant="outlined"
              :loading="isSubmitting"
              v-bind="emailProps"
              class="mb-6"
            />

            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="isSubmitting"
              style="text-transform: none; font-weight: 500; height: 48px"
              class="mb-4"
            >
              发送重置邮件
            </v-btn>

            <p class="text-body-2" style="color: #757575">
              想起密码了？
              <v-btn
                variant="text"
                color="primary"
                to="/account/signin"
                size="small"
                style="text-transform: none; padding: 0; min-width: auto; height: auto; vertical-align: baseline"
                class="text-decoration-none"
              >
                <v-icon start size="16">mdi-arrow-left</v-icon>
                返回登录
              </v-btn>
            </p>
          </v-form>
        </div>
      </div>
    </v-fade-transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'

import { UserApi } from '@/network/api/users'
import { ServerError } from '@/network/types/error'

const myAlert = ref<{
  message: string | undefined
  type: 'success' | 'info' | 'warning' | 'error' | undefined
}>({
  message: '',
  type: 'error',
})

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      email: z.string().email(),
    })
  ),
})

const [email, emailProps] = defineField('email', vuetifyConfig)

// const router = useRouter()

const submit = handleSubmit(async (value) => {
  try {
    await UserApi.recoverPasswordRequest(value.email)
    myAlert.value = {
      message: '重置密码邮件已发送，请注意查收',
      type: 'success',
    }
  } catch (e) {
    if (e instanceof ServerError) {
      myAlert.value = {
        message: e.message,
        type: 'error',
      }
    } else {
      toast.error(e as string)
    }
  }
})
</script>
@/network/api/users/user
