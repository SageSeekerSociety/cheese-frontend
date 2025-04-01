<template>
  <div class="real-name-info">
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="d-flex align-center">
        <h2 class="text-h5 font-weight-medium mb-0">实名信息</h2>
        <v-chip class="ml-3" size="small" color="primary" variant="outlined">
          <v-icon start icon="mdi-eye-off-outline" size="small"></v-icon>
          已模糊处理
        </v-chip>
      </div>
      <v-chip
        :color="hasRealNameInfo ? 'success' : 'warning'"
        variant="tonal"
        size="small"
        class="status-chip"
        :prepend-icon="hasRealNameInfo ? 'mdi-check-circle' : 'mdi-alert-circle'"
      >
        {{ hasRealNameInfo ? '已完成认证' : '未完成认证' }}
      </v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-6">
      您的实名信息用于身份认证、评优评奖等场景。所有信息都经过加密存储，访问受到严格控制，且每次访问都会被记录。
    </p>

    <!-- 信息卡片 -->
    <v-card v-if="!loading" class="info-card mb-8" rounded="lg" variant="flat">
      <v-card-text class="pb-0">
        <v-row>
          <!-- 左侧：实名信息内容 -->
          <v-col cols="12" md="8">
            <div class="d-flex align-start mb-6">
              <v-icon icon="mdi-shield-lock" size="24" color="primary" class="mr-3 mt-1"></v-icon>
              <div>
                <div class="text-subtitle-1 font-weight-medium">您的加密实名信息</div>
                <div class="text-caption text-medium-emphasis">此信息已加密存储，仅在必要时由授权人员访问</div>
              </div>
            </div>

            <v-row>
              <v-col cols="12" sm="6">
                <div class="info-field mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">真实姓名</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-account" size="small" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-1 font-weight-medium">{{ realNameInfo?.realName || '未填写' }}</span>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="info-field mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">学号</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-card-account-details" size="small" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-1 font-weight-medium">{{ realNameInfo?.studentId || '未填写' }}</span>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" sm="4">
                <div class="info-field mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">年级</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-school" size="small" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-1 font-weight-medium">{{ realNameInfo?.grade || '未填写' }}</span>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" sm="4">
                <div class="info-field mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">专业</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-book-education" size="small" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-1 font-weight-medium">{{ realNameInfo?.major || '未填写' }}</span>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" sm="4">
                <div class="info-field mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">班级</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-account-group" size="small" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-1 font-weight-medium">{{ realNameInfo?.className || '未填写' }}</span>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <!-- 右侧：信息安全状态卡片 -->
          <v-col cols="12" md="4">
            <v-card class="status-info-card h-100" rounded="lg" color="grey-lighten-4" variant="flat">
              <v-card-text>
                <div class="d-flex flex-column justify-space-between h-100">
                  <div>
                    <div class="text-subtitle-2 font-weight-medium mb-4">信息安全状态</div>

                    <div class="status-item d-flex align-start mb-3">
                      <v-avatar size="24" class="mr-2 success-bg">
                        <v-icon icon="mdi-lock" size="14" color="white"></v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-body-2 font-weight-medium">端到端加密</div>
                        <div class="text-caption text-medium-emphasis">信息以加密形式安全存储</div>
                      </div>
                    </div>

                    <div class="status-item d-flex align-start mb-3">
                      <v-avatar size="24" class="mr-2 success-bg">
                        <v-icon icon="mdi-account-key" size="14" color="white"></v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-body-2 font-weight-medium">访问控制</div>
                        <div class="text-caption text-medium-emphasis">严格的访问权限管理</div>
                      </div>
                    </div>

                    <div class="status-item d-flex align-start">
                      <v-avatar size="24" class="mr-2 success-bg">
                        <v-icon icon="mdi-history" size="14" color="white"></v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-body-2 font-weight-medium">访问记录</div>
                        <div class="text-caption text-medium-emphasis">记录所有对信息的访问</div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4">
                    <v-btn
                      :to="{ name: 'PrivacyCenterAccessLogs' }"
                      color="primary"
                      variant="text"
                      size="small"
                      block
                      class="mb-2"
                    >
                      查看访问记录
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider class="my-4"></v-divider>

      <v-card-actions class="px-4 pb-4">
        <v-btn color="primary" variant="flat" :to="{ name: 'UserSettingsRealName' }" prepend-icon="mdi-pencil">
          编辑实名信息
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" prepend-icon="mdi-eye" :to="{ name: 'PrivacyCenterAccessLogs' }">
          查看访问记录
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 加载状态 -->
    <v-card v-else class="loading-card mb-8" rounded="lg" variant="flat">
      <v-card-text class="d-flex justify-center align-center py-8">
        <v-progress-circular indeterminate color="primary" class="mr-3"></v-progress-circular>
        <span>正在加载实名信息...</span>
      </v-card-text>
    </v-card>

    <!-- 实名信息使用场景说明（整合了原对话框内容） -->
    <v-card class="usage-card" variant="flat" rounded="lg">
      <v-card-text>
        <div class="d-flex align-start mb-4">
          <v-icon icon="mdi-shield-lock-outline" size="24" color="primary" class="mr-3 mt-1"></v-icon>
          <div>
            <div class="text-subtitle-1 font-weight-medium">实名信息的使用场景与保护</div>
            <div class="text-caption text-medium-emphasis">我们如何使用和保护您的实名信息</div>
          </div>
        </div>

        <!-- 使用场景说明 -->
        <div class="mb-6">
          <h3 class="text-subtitle-2 font-weight-medium mb-3">实名信息使用场景</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="usage-scenario-card h-100" variant="flat" rounded="lg">
                <v-card-text>
                  <div class="d-flex flex-column h-100">
                    <v-avatar size="42" class="primary-soft mb-3" rounded>
                      <v-icon icon="mdi-account-check" size="24" color="primary"></v-icon>
                    </v-avatar>
                    <div class="text-subtitle-2 font-weight-medium mb-1">身份验证与导师匹配</div>
                    <p class="text-body-2 text-medium-emphasis flex-grow-1">
                      验证参与者身份，帮助导师了解学生背景并匹配合适的项目。
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="6">
              <v-card class="usage-scenario-card h-100" variant="flat" rounded="lg">
                <v-card-text>
                  <div class="d-flex flex-column h-100">
                    <v-avatar size="42" class="primary-soft mb-3" rounded>
                      <v-icon icon="mdi-certificate" size="24" color="primary"></v-icon>
                    </v-avatar>
                    <div class="text-subtitle-2 font-weight-medium mb-1">项目结题认证</div>
                    <p class="text-body-2 text-medium-emphasis flex-grow-1">用于赛题结题后的项目认证与证书发放流程。</p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="6">
              <v-card class="usage-scenario-card h-100" variant="flat" rounded="lg">
                <v-card-text>
                  <div class="d-flex flex-column h-100">
                    <v-avatar size="42" class="primary-soft mb-3" rounded>
                      <v-icon icon="mdi-trophy" size="24" color="primary"></v-icon>
                    </v-avatar>
                    <div class="text-subtitle-2 font-weight-medium mb-1">评奖评优</div>
                    <p class="text-body-2 text-medium-emphasis flex-grow-1">用于赛题结题后的奖项评定与优秀项目评选。</p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="6">
              <v-card class="usage-scenario-card h-100" variant="flat" rounded="lg">
                <v-card-text>
                  <div class="d-flex flex-column h-100">
                    <v-avatar size="42" class="primary-soft mb-3" rounded>
                      <v-icon icon="mdi-school" size="24" color="primary"></v-icon>
                    </v-avatar>
                    <div class="text-subtitle-2 font-weight-medium mb-1">学分认定</div>
                    <p class="text-body-2 text-medium-emphasis flex-grow-1">用于赛题结题后的学分认证与课程成绩登记。</p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- 隐私保护说明（从原对话框整合） -->
        <v-divider class="my-5"></v-divider>

        <div class="mb-4">
          <h3 class="text-subtitle-2 font-weight-medium mb-3">我们如何保护您的实名信息</h3>
          <p class="text-body-2 mb-4">
            我们采用多层保护机制，在满足赛题对实名信息的需求的同时，确保您的隐私安全与平台匿名性。
          </p>

          <v-row>
            <v-col cols="12" sm="6">
              <v-card class="usage-scenario-card h-100" variant="flat" rounded="lg">
                <v-card-text>
                  <div class="d-flex flex-column h-100">
                    <v-avatar size="42" class="primary-soft mb-3" rounded>
                      <v-icon icon="mdi-incognito" size="24" color="primary"></v-icon>
                    </v-avatar>
                    <div class="text-subtitle-2 font-weight-medium mb-1">匿名参与</div>
                    <p class="text-body-2 text-medium-emphasis flex-grow-1">
                      平台上的日常活动保持匿名，其他用户无法看到您的真实身份信息。
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6">
              <v-card class="usage-scenario-card h-100" variant="flat" rounded="lg">
                <v-card-text>
                  <div class="d-flex flex-column h-100">
                    <v-avatar size="42" class="primary-soft mb-3" rounded>
                      <v-icon icon="mdi-key-variant" size="24" color="primary"></v-icon>
                    </v-avatar>
                    <div class="text-subtitle-2 font-weight-medium mb-1">加密存储</div>
                    <p class="text-body-2 text-medium-emphasis flex-grow-1">
                      使用行业标准的加密技术保护您的个人资料，防止未授权访问。
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6">
              <v-card class="usage-scenario-card h-100" variant="flat" rounded="lg">
                <v-card-text>
                  <div class="d-flex flex-column h-100">
                    <v-avatar size="42" class="primary-soft mb-3" rounded>
                      <v-icon icon="mdi-file-document-outline" size="24" color="primary"></v-icon>
                    </v-avatar>
                    <div class="text-subtitle-2 font-weight-medium mb-1">用途限制</div>
                    <p class="text-body-2 text-medium-emphasis flex-grow-1">
                      您的实名信息仅在必要的赛题报名环节使用，不用于其他目的。
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6">
              <v-card class="usage-scenario-card h-100" variant="flat" rounded="lg">
                <v-card-text>
                  <div class="d-flex flex-column h-100">
                    <v-avatar size="42" class="primary-soft mb-3" rounded>
                      <v-icon icon="mdi-eye-off-outline" size="24" color="primary"></v-icon>
                    </v-avatar>
                    <div class="text-subtitle-2 font-weight-medium mb-1">身份隔离</div>
                    <p class="text-body-2 text-medium-emphasis flex-grow-1">
                      严格隔离您的实名信息与平台账号，确保两者无法被关联。
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div class="d-flex align-center bg-grey-lighten-5 pa-3 rounded">
          <v-icon icon="mdi-information-outline" color="primary" class="mr-2"></v-icon>
          <p class="text-body-2 mb-0">
            所有对您实名信息的访问都会被记录，您可以随时在<router-link
              :to="{ name: 'PrivacyCenterAccessLogs' }"
              class="text-decoration-none"
              >访问记录</router-link
            >中查看这些记录。
          </p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import type { RealNameInfo } from '@/network/api/users/types'

import { onMounted, ref } from 'vue'

import { UserApi } from '@/network/api/users'
import { currentUserId } from '@/services/account'

const loading = ref(false)
const hasRealNameInfo = ref(false)
const realNameInfo = ref<RealNameInfo | undefined>()

// 获取实名信息
const fetchRealNameInfo = async () => {
  if (!currentUserId.value) return

  loading.value = true
  try {
    const { data } = await UserApi.getRealNameInfo(currentUserId.value, false)
    hasRealNameInfo.value = data.hasIdentity
    realNameInfo.value = data.identity
  } catch (error: any) {
    console.error('获取实名信息失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRealNameInfo()
})
</script>

<style scoped lang="scss">
.real-name-info {
  .status-chip {
    font-weight: 500;
  }

  .info-card {
    background-color: #ffffff;
    border: 1px solid rgba(var(--v-border-color), 0.12);
  }

  .status-info-card {
    border: 1px solid rgba(var(--v-border-color), 0.12);
  }

  .usage-card {
    background-color: #ffffff;
    border: 1px solid rgba(var(--v-border-color), 0.12);
  }

  .usage-scenario-card {
    transition: all 0.2s ease;
    border: 1px solid rgba(var(--v-border-color), 0.12);
    background-color: #ffffff;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.15);
      box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.05);
    }
  }

  .info-field {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, rgba(var(--v-theme-primary), 0.08), transparent);
    }
  }

  .primary-soft {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }

  .success-bg {
    background-color: #4caf50;
  }

  .privacy-feature-card {
    height: 100%;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid rgba(var(--v-border-color), 0.12);
    background-color: #ffffff;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.15);
      box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.05);
    }
  }

  .data-info {
    display: inline-block;
    margin-top: 4px;
    padding: 2px 0;
    font-style: italic;
    font-weight: 500;
    color: rgb(var(--v-theme-primary));
  }
}
</style>
