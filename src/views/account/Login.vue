<template>
  <v-card class="mx-auto" max-width="600" width="100%">
    <v-card-title>登录</v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field label="用户名" placeholder="请输入用户名" prepend-inner-icon="mdi-account" type="text" />
        <v-text-field label="密码" placeholder="请输入密码" prepend-inner-icon="mdi-lock" type="password" />
        <v-checkbox density="compact">
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
      <v-btn variant="text" color="primary" to="signup">注册账户</v-btn>
      <v-btn variant="plain" color="on-background">无法登录？</v-btn>
      <v-spacer />
      <v-btn color="primary">登录</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
</script>
