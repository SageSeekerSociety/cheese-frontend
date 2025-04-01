<template>
  <div class="privacy-center">
    <v-container class="px-md-6">
      <!-- 页面标题与描述 -->
      <div class="mb-8 text-center">
        <div class="d-flex justify-center mb-3">
          <v-avatar size="60" class="privacy-icon-wrapper mb-2" rounded="lg">
            <v-icon icon="mdi-shield-lock" size="32" color="primary"></v-icon>
          </v-avatar>
        </div>
        <h1 class="text-h4 font-weight-medium mb-2">隐私与安全中心</h1>
        <p class="text-body-2 text-medium-emphasis mx-auto" style="max-width: 600px">
          在这里您可以查看和管理与隐私安全相关的所有设置，了解我们如何保护您的数据安全
        </p>
      </div>

      <!-- 主导航 -->
      <v-card class="mb-4 privacy-tabs-card" variant="flat" rounded="lg">
        <v-tabs
          v-model="currentTab"
          color="primary"
          align-tabs="center"
          density="comfortable"
          bg-color="background"
          class="privacy-tabs"
          slider-color="primary"
          show-arrows
        >
          <v-tab value="overview" :to="{ name: 'PrivacyCenter' }" exact>
            <v-icon icon="mdi-view-dashboard-outline" size="small" class="mr-1"></v-icon>
            概览
          </v-tab>

          <v-tab value="real-name" :to="{ name: 'PrivacyCenterRealNameInfo' }">
            <v-icon icon="mdi-account-card-outline" size="small" class="mr-1"></v-icon>
            实名信息
          </v-tab>

          <v-tab value="access-logs" :to="{ name: 'PrivacyCenterAccessLogs' }">
            <v-icon icon="mdi-history" size="small" class="mr-1"></v-icon>
            访问记录
          </v-tab>

          <v-tab value="data-sharing" :to="{ name: 'PrivacyCenterDataSharing' }">
            <v-icon icon="mdi-clipboard-text-outline" size="small" class="mr-1"></v-icon>
            实名赛题
          </v-tab>

          <v-tab value="policy" :to="{ name: 'PrivacyCenterPolicy' }">
            <v-icon icon="mdi-file-document-outline" size="small" class="mr-1"></v-icon>
            隐私政策
          </v-tab>
        </v-tabs>
      </v-card>

      <v-card class="content-card mb-4" variant="flat" rounded="lg">
        <v-card-text class="pa-4 pa-md-6">
          <transition name="fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </v-card-text>
      </v-card>

      <v-card variant="tonal" color="primary" rounded="lg" class="help-card">
        <v-card-text class="pa-4">
          <div class="d-flex flex-column flex-md-row align-md-center">
            <div class="mb-3 mb-md-0 mr-md-4">
              <div class="text-subtitle-1 font-weight-medium mb-1">需要帮助？</div>
              <p class="text-body-2 mb-0">如有隐私方面的问题或疑虑，请联系我们的隐私支持团队</p>
            </div>
            <v-btn variant="flat" size="small" class="ml-md-auto" prepend-icon="mdi-email-outline">
              联系支持团队
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// 路由相关
const route = useRoute()
const currentTab = ref('overview')

// 路由映射到标签页值
const routeToTabMap: Record<string, string> = {
  PrivacyCenter: 'overview',
  PrivacyCenterRealNameInfo: 'real-name',
  PrivacyCenterAccessLogs: 'access-logs',
  PrivacyCenterDataSharing: 'data-sharing',
  PrivacyCenterPolicy: 'policy',
}

// 根据当前路由更新标签页
watch(
  () => route.name,
  (newRouteName) => {
    const routeName = newRouteName as string
    if (routeName && Object.prototype.hasOwnProperty.call(routeToTabMap, routeName)) {
      currentTab.value = routeToTabMap[routeName]
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.privacy-center {
  // 标题图标容器
  .privacy-icon-wrapper {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.15));
  }

  // 标签页卡片
  .privacy-tabs-card {
    border-bottom: 1px solid rgba(var(--v-theme-primary), 0.08);
  }

  // 标签页样式
  .privacy-tabs {
    .v-tab {
      min-width: 100px;
      font-weight: 500;
      text-transform: none;
      letter-spacing: normal;
    }
  }

  // 内容卡片
  .content-card {
    min-height: 300px;
    background-color: #ffffff;
    border: 1px solid rgba(var(--v-border-color), 0.12);
  }

  // 功能卡片
  .feature-card {
    height: 100%;
    transition: all 0.2s ease;
    cursor: pointer;
    opacity: 0.7;
    border-color: rgba(var(--v-border-color), 0.12);

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.2);
    }
  }

  // 过渡动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
