<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- 桌面端：左边logo区域 -->
      <v-col cols="12" md="5" class="d-none d-md-flex align-center justify-center" style="background-color: #fafafa">
        <div class="text-center">
          <v-img :src="logo" max-width="140" contain class="mx-auto mb-8" />
          <h1 class="text-h3 font-weight-light mb-3" style="color: #424242">知是</h1>
          <div class="text-body-1 font-weight-light" style="color: #757575">知无界，识有光</div>
        </div>
      </v-col>

      <!-- 桌面端：右边功能区域 | 移动端：全部区域 -->
      <v-col cols="12" md="7" class="d-flex flex-column" style="background-color: white">
        <!-- 移动端：顶部logo区域 -->
        <div class="d-md-none text-center py-8" style="background-color: #fafafa">
          <v-img :src="logo" max-width="100" contain class="mx-auto mb-4" />
          <h1 class="text-h4 font-weight-light mb-2" style="color: #424242">知是</h1>
          <div class="text-subtitle-1 font-weight-light" style="color: #757575">知无界，识有光</div>
        </div>

        <!-- 内容区域 -->
        <div class="flex-grow-1 d-flex flex-column justify-center px-16 py-12">
          <div class="w-100" style="max-width: 400px">
            <v-defaults-provider :defaults="defaults">
              <router-view v-slot="{ Component }">
                <v-scroll-x-reverse-transition mode="out-in">
                  <component :is="Component" />
                </v-scroll-x-reverse-transition>
              </router-view>
            </v-defaults-provider>
          </div>
        </div>

        <!-- Footer - 与内容区对齐 -->
        <div class="d-none d-md-block px-16 pb-8">
          <div class="text-caption font-weight-light" style="color: #9e9e9e; max-width: 400px">
            <span class="mr-3">&copy; 2023 - 2025</span>
            <span class="mr-3">|</span>
            <span
              >Made with <v-icon color="red" size="12" class="mx-1">mdi-heart</v-icon> by
              <a
                href="https://github.com/SageSeekerSociety"
                target="_blank"
                class="text-decoration-none"
                style="color: #757575"
                >SageSeekerSociety</a
              >
            </span>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import logo from '@/assets/logo.svg?url'

const defaults = ref({
  VTextField: {
    variant: 'outlined',
    density: 'comfortable',
  },
  VBtn: {
    elevation: 0,
  },
  VAlert: {
    border: false,
  },
})
</script>
