<template>
  <v-card class="mx-auto" max-width="600" width="100%">
    <v-card-title>注册</v-card-title>
    <v-card-text>
      <v-alert closable :text="error" type="error" v-if="error" class="mb-4"></v-alert>

      <v-form @submit.prevent="submit" ref="signupForm">
        <v-text-field label="用户名" placeholder="请输入用户名" prepend-inner-icon="mdi-account" type="text"
          hint="用户名是用于登录的唯一标识，只能使用英文字母、数字、下划线" v-model="username" v-bind="usernameProps" required />
        <v-text-field label="昵称" placeholder="请输入昵称" prepend-inner-icon="mdi-account" type="text" v-model="nickname"
          v-bind="nicknameProps" required />
        <v-text-field label="密码" placeholder="请输入密码" prepend-inner-icon="mdi-lock" type="password" v-model="password"
          v-bind="passwordProps" required />
        <v-text-field label="确认密码" placeholder="请再次输入密码" prepend-inner-icon="mdi-lock" type="password"
          v-model="confirmPassword" v-bind="confirmPasswordProps" required />
        <v-text-field label="邮箱" placeholder="请输入邮箱" prepend-inner-icon="mdi-email" type="email" v-model="email"
          v-bind="emailProps" required />
        <v-checkbox density="compact" v-model="agree" v-bind="agreeProps" required>
          <template #label>
            我已阅读并同意
            <a href="#">用户协议</a>
            和
            <a href="#">隐私政策</a>
          </template>
        </v-checkbox>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" color="primary" to="signin">已有账号</v-btn>
      <v-spacer />
      <v-btn color="primary" @click="submit" :loading="isSubmitting">注册</v-btn>
    </v-card-actions>
  </v-card>
</template>
  
<script lang="ts" setup>
import { useSignupStore } from '@/store/signup';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useRouter } from 'vue-router';
import { toast } from 'vuetify-sonner';
import { ref } from 'vue';
import { ServerError } from '@/network/types/error'

const error = ref('');

const { handleSubmit, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      username: z.string().min(4).max(16).regex(/^[a-zA-Z0-9_]{4,16}$/, { message: '用户名只能使用英文字母、数字、下划线' }),
      nickname: z.string().min(2).max(16).regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,16}$/, { message: '昵称只能使用英文字母、数字、下划线、中文' }),
      // eslint-disable-next-line no-control-regex
      password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\x00-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]).{8,}$/, { message: '密码必须包含字母、数字、特殊字符' }),
      // eslint-disable-next-line no-control-regex
      confirmPassword: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\x00-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]).{8,}$/, { message: '密码必须包含字母、数字、特殊字符' }),
      email: z.string().email(),
      agree: z.boolean().refine((v) => v, { message: '请同意用户协议和隐私政策' }),
    }).superRefine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: '两次输入的密码不一致',
        });
      }
    }),
  ),
});

const vuetifyConfig = (state: { errors: any; }) => ({
  props: {
    'error-messages': state.errors,
  },
});

const [username, usernameProps] = defineField('username', vuetifyConfig);
const [nickname, nicknameProps] = defineField('nickname', vuetifyConfig);
const [password, passwordProps] = defineField('password', vuetifyConfig);
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword', vuetifyConfig);
const [email, emailProps] = defineField('email', vuetifyConfig);
const [agree, agreeProps] = defineField('agree', vuetifyConfig);

const signupStore = useSignupStore();
const router = useRouter();

const submit = handleSubmit(async value => {
  try {
    await signupStore.startSignup(value);
    router.push('/account/signup/verify-email');
  } catch (e) {
    if (e instanceof ServerError) {
      error.value = e.message;
    } else {
      toast.error(e as string);
    }
  }
});
</script>
