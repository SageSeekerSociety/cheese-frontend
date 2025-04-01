<template>
  <div class="access-logs">
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-medium mb-0">实名信息访问记录</h2>
      <v-chip color="info" variant="tonal" size="small" class="privacy-status-chip" prepend-icon="mdi-history">
        {{ paging.customParams.value.total || 0 }} 条访问记录
      </v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-6">
      在这里您可以查看所有访问过您实名信息的记录，包括谁在何时出于什么目的查看了您的信息。
      我们记录每一次对您信息的访问，确保完全透明。
    </p>

    <!-- 数据表格 -->
    <v-card variant="flat" rounded="lg" class="mb-6 access-table">
      <infinite-scroll
        :loading="paging.loadingMore.value"
        :has-more="paging.hasMore.value"
        :initial-loading="paging.refreshing.value && !paging.data.value.length"
        :is-empty="!paging.data.value.length"
        :force-manual="true"
        @load-more="loadMore"
      >
        <!-- 自定义表格 -->
        <div class="custom-table">
          <!-- 表头 -->
          <div class="table-header d-flex">
            <div class="table-cell accessor">访问者</div>
            <div class="table-cell access-time">访问时间</div>
            <div class="table-cell access-type">访问类型</div>
            <div class="table-cell access-entity">访问目的</div>
            <div class="table-cell ip-address">IP地址</div>
          </div>

          <!-- 表格内容 -->
          <div v-for="(item, index) in paging.data.value" :key="index" class="table-row d-flex">
            <!-- 访问者 -->
            <div class="table-cell accessor">
              <div class="d-flex align-center">
                <v-avatar size="32" class="mr-2">
                  <v-img :src="getAvatarUrl(item.accessor.avatarId)" />
                </v-avatar>
                <span>{{ item.accessor.nickname }}</span>
              </div>
            </div>

            <!-- 访问时间 -->
            <div class="table-cell access-time">
              {{ formatDate(item.accessTime) }}
            </div>

            <!-- 访问类型 -->
            <div class="table-cell access-type">
              <v-chip :color="accessTypeColor(item.accessType)" size="small" variant="tonal" class="font-weight-medium">
                {{ accessTypeText(item.accessType) }}
              </v-chip>
            </div>

            <!-- 访问目的 -->
            <div class="table-cell access-entity">
              <div class="d-flex align-center">
                <v-icon
                  :icon="accessModuleIcon(item.accessModuleType)"
                  size="small"
                  class="mr-1"
                  :color="accessModuleColor(item.accessModuleType)"
                ></v-icon>
                <span>{{ accessEntityText(item) }}</span>
              </div>
            </div>

            <!-- IP地址 -->
            <div class="table-cell ip-address">
              <div class="d-flex align-center">
                <v-icon icon="mdi-ip-network" size="small" class="mr-1 text-medium-emphasis"></v-icon>
                <span class="text-body-2">{{ item.ipAddress }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载中状态 -->
        <template #loading>
          <div class="d-flex justify-center py-3">
            <v-progress-circular indeterminate size="24" width="2" color="primary"></v-progress-circular>
            <span class="text-body-2 ml-2">加载更多记录...</span>
          </div>
        </template>

        <!-- 没有更多数据 -->
        <template #no-more>
          <div class="d-flex justify-center py-3">
            <v-icon icon="mdi-check-circle" size="small" color="success" class="mr-1"></v-icon>
            <span class="text-body-2 text-medium-emphasis">已加载全部记录</span>
          </div>
        </template>

        <!-- 空状态 -->
        <template #empty>
          <div class="d-flex flex-column align-center py-8">
            <v-icon icon="mdi-shield-check" size="56" color="success" class="mb-3"></v-icon>
            <span class="text-h6 mb-1">暂无访问记录</span>
            <span class="text-body-2 text-medium-emphasis">您的实名信息未被任何人访问过</span>
          </div>
        </template>

        <!-- 加载状态 -->
        <template #skeleton>
          <div class="d-flex flex-column align-center py-8">
            <v-progress-circular indeterminate color="primary" size="48" class="mb-3"></v-progress-circular>
            <div class="text-body-1">正在加载访问记录...</div>
          </div>
        </template>
      </infinite-scroll>
    </v-card>

    <!-- 隐私提示 -->
    <v-alert
      type="info"
      variant="tonal"
      class="mt-4"
      border="start"
      density="comfortable"
      icon="mdi-information-outline"
    >
      <div class="text-subtitle-2 font-weight-medium mb-1">关于实名信息访问</div>
      <p class="text-body-2 mb-0">
        我们严格限制对您实名信息的访问，只有在赛题认证、评优评奖等特定场景下，指定的工作人员才能查看这些信息。
        所有访问都会被记录并可以在此页面查看。如果您发现任何可疑的访问记录，请立即
        <a href="#" class="text-decoration-none">联系我们</a>。
      </p>
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
import type {
  UserIdentityAccessLog,
  UserIdentityAccessModuleType,
  UserIdentityAccessType,
} from '@/network/api/users/types'

import { onMounted } from 'vue'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'
import { usePaging } from '@/utils/paging'

import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import { UserApi } from '@/network/api/users'
import { currentUserId } from '@/services/account'

const pageSize = 10

const fetchLogs = async (pageStart?: number, customParams?: LogsParams) => {
  if (!currentUserId.value) return { data: [], page: { page_start: 0, page_size: 0, next_start: 0, has_more: false } }

  try {
    const { data } = await UserApi.getRealNameAccessLogs(currentUserId.value, pageStart, pageSize)

    // 更新总数
    if (data.page.total && customParams) {
      customParams.total = data.page.total
    }

    return {
      data: data.logs,
      page: {
        page_start: pageStart || 0,
        page_size: pageSize,
        next_start: data.page.next_start,
        has_more: data.page.has_more,
        total: data.page.total,
      },
    }
  } catch (error) {
    console.error('获取访问记录失败', error)
    return { data: [], page: { page_start: 0, page_size: 0, next_start: 0, has_more: false } }
  }
}

interface LogsParams {
  total?: number
}

const paging = usePaging<UserIdentityAccessLog, LogsParams>(fetchLogs, undefined, { total: 0 })

// 加载更多记录
const loadMore = () => {
  paging.loadMore()
}

const formatDate = (date: string | Date | number) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 访问类型文本
const accessTypeText = (type: UserIdentityAccessType) => {
  switch (type) {
    case 'VIEW':
      return '查看'
    case 'EXPORT':
      return '导出'
    default:
      return '未知'
  }
}

// 访问类型颜色
const accessTypeColor = (type: UserIdentityAccessType) => {
  switch (type) {
    case 'VIEW':
      return 'info'
    case 'EXPORT':
      return 'warning'
    default:
      return 'grey'
  }
}

// 访问模块图标
const accessModuleIcon = (type?: UserIdentityAccessModuleType) => {
  switch (type) {
    case 'TASK':
      return 'mdi-clipboard-text-outline'
    default:
      return 'mdi-account-check-outline'
  }
}

// 访问模块颜色
const accessModuleColor = (type?: UserIdentityAccessModuleType) => {
  switch (type) {
    case 'TASK':
      return 'primary'
    default:
      return 'grey'
  }
}

// 访问实体文本
const accessEntityText = (log: UserIdentityAccessLog) => {
  if (log.accessEntityName) {
    return `${log.accessEntityName}`
  }

  switch (log.accessModuleType) {
    case 'TASK':
      return '赛题认证需要'
    default:
      return '身份验证'
  }
}

onMounted(() => {
  paging.refresh()
})
</script>

<style scoped lang="scss">
.access-logs {
  .access-table {
    background-color: #ffffff;
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    overflow: hidden;

    .custom-table {
      width: 100%;

      .table-header {
        background-color: rgba(var(--v-theme-primary), 0.05);
        font-weight: 500;
        border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
      }

      .table-row {
        border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
        transition: background-color 0.2s ease;

        &:hover {
          background-color: rgba(var(--v-theme-primary), 0.03);
        }

        &:last-child {
          border-bottom: none;
        }
      }

      .table-cell {
        padding: 12px 16px;
        display: flex;
        align-items: center;
      }

      .accessor {
        width: 25%;
      }

      .access-time {
        width: 20%;
      }

      .access-type {
        width: 12%;
      }

      .access-entity {
        width: 25%;
      }

      .ip-address {
        width: 18%;
      }
    }
  }

  .privacy-status-chip {
    font-weight: 500;
  }
}
</style>
