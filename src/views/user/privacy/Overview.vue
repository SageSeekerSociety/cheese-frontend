<template>
  <div class="privacy-overview">
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-medium mb-0">隐私概览</h2>
      <v-chip color="success" variant="tonal" size="small" class="privacy-status-chip" prepend-icon="mdi-shield-check">
        隐私保护状态良好
      </v-chip>
    </div>

    <!-- Stats summary cards -->
    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <v-card class="privacy-stat-card" variant="flat" rounded="lg">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="42" class="primary-soft mr-3">
                <v-icon icon="mdi-shield-account" size="24" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">100%</div>
                <div class="text-caption text-medium-emphasis">实名信息保护率</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="privacy-stat-card" variant="flat" rounded="lg">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="42" class="primary-soft mr-3">
                <v-icon icon="mdi-history" size="24" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">{{ accessLogCount || 0 }}</div>
                <div class="text-caption text-medium-emphasis">实名信息近期访问次数</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="privacy-stat-card" variant="flat" rounded="lg">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="42" class="primary-soft mr-3">
                <v-icon icon="mdi-clipboard-text-outline" size="24" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">3</div>
                <div class="text-caption text-medium-emphasis">实名赛题数量</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent activity -->
    <div class="mb-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-subtitle-1 font-weight-medium mb-0">近期活动</h3>
        <v-btn
          variant="text"
          color="primary"
          size="small"
          :to="{ name: 'PrivacyCenterAccessLogs' }"
          density="comfortable"
        >
          查看全部
          <template #append>
            <v-icon icon="mdi-chevron-right" size="small"></v-icon>
          </template>
        </v-btn>
      </div>

      <v-card class="mb-4" variant="flat" rounded="lg" border>
        <v-list lines="two">
          <template v-if="recentLogs && recentLogs.length > 0">
            <v-list-item
              v-for="(log, index) in recentLogs"
              :key="index"
              :class="index < recentLogs.length - 1 ? 'border-b' : ''"
            >
              <template #prepend>
                <v-avatar size="36">
                  <v-img :src="getAvatarUrl(log.accessor.avatarId)" />
                </v-avatar>
              </template>

              <v-list-item-title>
                <span class="font-weight-medium">
                  {{ log.accessor.id === currentUserId ? '您' : log.accessor.nickname }}
                </span>
                <span class="text-medium-emphasis">
                  {{ log.accessor.id === currentUserId ? '查看了自己的实名信息' : '查看了您的实名信息' }}
                </span>
              </v-list-item-title>

              <v-list-item-subtitle>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-calendar-clock" size="small" class="mr-1"></v-icon>
                  <span>{{ formatDate(log.accessTime) }}</span>
                  <v-divider vertical class="mx-2"></v-divider>
                  <v-icon icon="mdi-tag" size="small" class="mr-1"></v-icon>
                  <span>{{ getAccessReason(log) }}</span>
                </div>
              </v-list-item-subtitle>
            </v-list-item>
          </template>

          <v-list-item v-if="!recentLogs || recentLogs.length === 0">
            <v-list-item-title class="text-center py-4">
              <v-icon icon="mdi-shield-check" size="48" color="success" class="mb-2"></v-icon>
              <div class="text-h6">暂无访问记录</div>
              <div class="text-body-2 text-medium-emphasis">您的实名信息目前未被任何人访问</div>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- Quick actions -->
    <div class="mb-6">
      <h3 class="text-subtitle-1 font-weight-medium mb-4">快捷操作</h3>

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-card class="action-card" variant="flat" rounded="lg" :to="{ name: 'PrivacyCenterRealNameInfo' }">
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-avatar size="40" class="primary-soft mr-3">
                  <v-icon color="primary" icon="mdi-account-card-outline"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-medium">查看实名信息</div>
                  <div class="text-caption text-medium-emphasis">查看和管理您的实名认证信息</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card class="action-card" variant="flat" rounded="lg" :to="{ name: 'PrivacyCenterAccessLogs' }">
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-avatar size="40" class="primary-soft mr-3">
                  <v-icon color="primary" icon="mdi-history"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-medium">访问记录</div>
                  <div class="text-caption text-medium-emphasis">查看谁访问了您的实名信息</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card class="action-card" variant="flat" rounded="lg" :to="{ name: 'PrivacyCenterDataSharing' }">
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-avatar size="40" class="primary-soft mr-3">
                  <v-icon color="primary" icon="mdi-clipboard-text-outline"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-medium">实名赛题</div>
                  <div class="text-caption text-medium-emphasis">了解您参与的需要实名的赛题</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { UserIdentityAccessLog } from '@/network/api/users/types'

import { computed, onMounted, ref } from 'vue'

import { getAvatarUrl } from '@/utils/materials'

import { UserApi } from '@/network/api/users'
import { currentUserId } from '@/services/account'

// 实名信息访问记录
const accessLogs = ref<UserIdentityAccessLog[]>([])
const accessLogCount = ref(0)
const loading = ref(false)

// 获取访问记录
const fetchAccessLogs = async () => {
  if (!currentUserId.value) return

  loading.value = true
  try {
    // 只获取最近的记录用于概览页面显示
    const { data } = await UserApi.getRealNameAccessLogs(currentUserId.value, undefined, 5)
    accessLogs.value = data.logs
    accessLogCount.value = data.page.total || 0
  } catch (error) {
    console.error('获取访问记录失败', error)
  } finally {
    loading.value = false
  }
}

// 最近访问记录
const recentLogs = computed(() => {
  return accessLogs.value.slice(0, 3)
})

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取访问原因
const getAccessReason = (log: UserIdentityAccessLog) => {
  if (log.accessEntityName) {
    return `用于${log.accessEntityName}`
  }

  switch (log.accessModuleType) {
    case 'TASK':
      return '用于赛题认证'
    default:
      return '身份验证'
  }
}
onMounted(() => {
  fetchAccessLogs()
})
</script>

<style scoped lang="scss">
.privacy-overview {
  .privacy-status-chip {
    font-weight: 500;
  }

  .privacy-stat-card {
    background-color: #ffffff;
    border: 1px solid rgba(var(--v-border-color), 0.12);

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.15);
    }
  }

  .primary-soft {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }

  .action-card {
    transition: all 0.2s ease;
    cursor: pointer;
    height: 100%;
    background-color: #ffffff;
    border: 1px solid rgba(var(--v-border-color), 0.12);

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.15);
      background-color: rgba(var(--v-theme-primary), 0.02);
    }
  }
}
</style>
