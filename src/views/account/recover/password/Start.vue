<template>
  <v-card class="mx-auto" max-width="600" width="100%">
    <v-card-title>找回密码</v-card-title>
    <v-card-text>
      <v-alert closable :text="myAlert.message" :type="myAlert.type" v-if="myAlert.message" class="mb-4"></v-alert>

      <v-form @submit.prevent="submit">
        <v-text-field label="邮箱" placeholder="请输入邮箱" prepend-inner-icon="mdi-email" type="email" v-model="email"
          v-bind="emailProps" required />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" color="primary" to="/account/signin">返回登录</v-btn>
      <v-spacer />
      <v-btn color="primary" @click="submit" :loading="isSubmitting">提交</v-btn>
    </v-card-actions>
  </v-card>
</template>
  
<script lang="ts" setup>
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useRouter } from 'vue-router';
import { toast } from 'vuetify-sonner';
import { ref } from 'vue';
import { ServerError } from '@/network/types/error';
import { UserApi } from '@/network/api/user';

const myAlert = ref<{
  message: string | undefined;
  type: 'success' | 'info' | 'warning' | 'error' | undefined
}>({
  message: '',
  type: 'error',
});

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      email: z.string().email(),
    }),
  ),
});

const vuetifyConfig = (state: { errors: any; }) => ({
  props: {
    'error-messages': state.errors,
  },
});

const [email, emailProps] = defineField('email', vuetifyConfig);

const router = useRouter();

const submit = handleSubmit(async value => {
  try {
    await UserApi.recoverPasswordRequest(value.email);
    myAlert.value = {
      message: '重置密码邮件已发送，请注意查收',
      type: 'success',
    };
  } catch (e) {
    if (e instanceof ServerError) {
      myAlert.value = {
        message: e.message,
        type: 'error',
      }
    } else {
      toast.error(e as string);
    }
  }
});
</script>
