<template>
  <v-card class="mx-auto" max-width="500" rounded="lg">
    <v-card-item
      class="bg-primary text-white"
      prepend-icon="mdi-lock-reset"
      title="重置账户密码"
      subtitle="通过注册邮箱验证身份"
    />

    <v-card-text class="pa-6">
      <v-fade-transition mode="out-in">
        <div :key="String(isSubmitting)">
          <v-alert v-if="myAlert.message" :type="myAlert.type" density="compact" class="mb-4">
            {{ myAlert.message }}
          </v-alert>

          <v-form @submit.prevent="submit">
            <v-text-field
              v-model="email"
              label="注册邮箱"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              :loading="isSubmitting"
              v-bind="emailProps"
            />

            <v-btn block color="primary" size="large" type="submit" :loading="isSubmitting" class="mt-4">
              发送重置邮件
            </v-btn>

            <div class="text-center mt-4">
              <v-btn variant="text" color="primary" to="/account/signin" size="small" prepend-icon="mdi-arrow-left">
                返回登录
              </v-btn>
            </div>
          </v-form>
        </div>
      </v-fade-transition>
    </v-card-text>
  </v-card>
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
