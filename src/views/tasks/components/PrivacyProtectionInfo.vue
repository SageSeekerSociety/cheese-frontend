<template>
  <div>
    <!-- 信息保护卡片 -->
    <v-card class="mb-5 privacy-protection-card" variant="flat" rounded="lg">
      <v-card-text class="pa-0">
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex align-start pa-3">
              <v-avatar size="36" class="primary-soft mr-3">
                <v-icon icon="mdi-incognito" size="20" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-medium mb-1">匿名参与</div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  平台上的日常活动保持匿名，其他用户无法看到您的真实身份信息
                </p>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex align-start pa-3">
              <v-avatar size="36" class="primary-soft mr-3">
                <v-icon icon="mdi-key-variant" size="20" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-medium mb-1">加密存储</div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  使用行业标准的加密技术保护您的个人资料，防止未授权访问
                </p>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex align-start pa-3">
              <v-avatar size="36" class="primary-soft mr-3">
                <v-icon icon="mdi-file-document-outline" size="20" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-medium mb-1">用途限制</div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  您的实名信息仅在必要的赛题报名环节使用，不用于其他目的
                </p>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex align-start pa-3">
              <v-avatar size="36" class="primary-soft mr-3">
                <v-icon icon="mdi-eye-off-outline" size="20" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-medium mb-1">身份隔离</div>
                <p class="text-body-2 text-medium-emphasis mb-0">严格隔离您的实名信息与平台账号，确保两者无法被关联</p>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 使用场景 -->
    <div class="mb-4">
      <div class="text-subtitle-2 font-weight-medium mb-3">实名信息使用场景</div>
      <v-card variant="flat" rounded="lg" class="privacy-usage-card mb-3">
        <v-card-text class="pa-3">
          <div class="d-flex align-start">
            <v-avatar size="36" class="primary-soft mr-3">
              <v-icon icon="mdi-account-check" size="20" color="primary"></v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-medium mb-1">身份验证</div>
              <p class="text-body-2 text-medium-emphasis mb-0">用于确认参与者身份，保证赛题参与的真实性和有效性</p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card variant="flat" rounded="lg" class="privacy-usage-card mb-3">
        <v-card-text class="pa-3">
          <div class="d-flex align-start">
            <v-avatar size="36" class="primary-soft mr-3">
              <v-icon icon="mdi-bell-outline" size="20" color="primary"></v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-medium mb-1">参与资格筛选</div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                用于根据您的学业信息判断是否符合参与特定赛题的资格要求
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card variant="flat" rounded="lg" class="privacy-usage-card">
        <v-card-text class="pa-3">
          <div class="d-flex align-start">
            <v-avatar size="36" class="primary-soft mr-3">
              <v-icon icon="mdi-certificate-outline" size="20" color="primary"></v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-medium mb-1">项目认证</div>
              <p class="text-body-2 text-medium-emphasis mb-0">用于赛题结题后的证书发放、学分认定和成果展示</p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- 用户权利 -->
    <v-alert type="info" variant="tonal" class="privacy-rights-alert mb-3" border="start" density="comfortable">
      <div class="text-subtitle-2 font-weight-medium mb-1">您的权利</div>
      <p class="text-body-2 mb-0">
        我们的系统采用多层保护机制，在满足少数赛题对实名信息的需求的同时，确保您在平台上的隐私安全。
        所有对您信息的访问都会被记录，您可以随时查看这些记录。
      </p>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
// 无需额外逻辑
</script>

<style scoped>
.primary-soft {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.privacy-protection-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background-color: rgb(var(--v-theme-surface));
}

.privacy-usage-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.privacy-usage-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.15);
  background-color: rgba(var(--v-theme-primary), 0.01);
}

.privacy-rights-alert {
  background-color: rgba(var(--v-theme-info), 0.05);
  border-color: rgba(var(--v-theme-info), 0.3);
}
</style>
