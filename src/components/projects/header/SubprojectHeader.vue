<template>
  <div class="subproject-header mb-4">
    <!-- 子项目标题栏 -->
    <div class="d-flex flex-wrap align-center gap-4 mb-4">
      <div class="d-flex align-center">
        <div
          class="subproject-color-indicator mr-3"
          :style="{ backgroundColor: subproject?.colorCode || '#f97316' }"
        ></div>
        <h1 class="text-h4 font-weight-medium">{{ subproject?.name || '加载中...' }}</h1>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center flex-wrap gap-2">
        <v-btn
          variant="outlined"
          rounded="pill"
          prepend-icon="mdi-pencil"
          class="project-action-btn"
          @click="emit('edit-subproject')"
        >
          编辑子项目
        </v-btn>
        <v-btn variant="tonal" color="primary" rounded="pill" prepend-icon="mdi-star" class="project-action-btn">
          关注子项目
        </v-btn>
      </div>
    </div>

    <!-- 子项目基本信息卡片 -->
    <v-card variant="flat" rounded="lg" class="project-info-card mb-4">
      <v-card-text class="pa-5">
        <v-row>
          <v-col cols="12" md="8">
            <div class="project-description mb-4">
              <p class="text-body-1">{{ subproject?.description || '暂无描述' }}</p>
            </div>

            <div class="project-meta d-flex flex-wrap gap-y-3">
              <div class="project-meta-item">
                <div class="text-caption text-medium-emphasis mb-1">时间范围</div>
                <div class="d-flex align-center">
                  <v-icon size="small" color="grey-darken-1" class="mr-1">mdi-calendar-range</v-icon>
                  <span class="text-body-2">{{ formatDateRange(subproject?.startDate, subproject?.endDate) }}</span>
                </div>
              </div>

              <div class="project-meta-item">
                <div class="text-caption text-medium-emphasis mb-1">负责人</div>
                <div class="d-flex align-center">
                  <v-icon size="small" color="grey-darken-1" class="mr-1">mdi-account</v-icon>
                  <span class="text-body-2">{{ subproject?.leader?.nickname || '未指定' }}</span>
                </div>
              </div>

              <div class="project-meta-item">
                <div class="text-caption text-medium-emphasis mb-1">所属项目</div>
                <div class="d-flex align-center">
                  <v-icon size="small" color="grey-darken-1" class="mr-1">mdi-folder-outline</v-icon>
                  <span class="text-body-2">{{ project?.name || '未知' }}</span>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="status-overview d-flex flex-column h-100 justify-center">
              <div class="status-cards d-flex flex-wrap gap-3">
                <div class="status-card">
                  <div class="status-value">{{ getCompletionPercentage() }}</div>
                  <div class="status-label">完成率</div>
                </div>

                <div class="status-card">
                  <div class="status-value">{{ getRemainingDays() }}</div>
                  <div class="status-label">剩余天数</div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 分割线 -->
    <v-divider class="mb-4"></v-divider>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types'

import { computed, defineEmits, defineProps } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'

const props = defineProps<{
  project: Project | null
  subproject: Project | null
}>()

const emit = defineEmits(['edit-subproject'])

const route = useRoute()
const router = useRouter()

// 获取当前项目和子项目ID
const projectId = computed(() => Number(route.params.projectId))

// 返回主项目
function backToMainProject() {
  router.push({
    name: 'ProjectOverview',
    params: { projectId: String(projectId.value) },
  })
}

// 格式化日期范围
const formatDateRange = (startDate?: number, endDate?: number) => {
  if (!startDate || !endDate) return '未设置'
  const start = dayjs(startDate).format('YYYY/MM/DD')
  const end = dayjs(endDate).format('YYYY/MM/DD')
  return `${start} - ${end}`
}

// 获取完成率（目前仅为占位，后续需连接实际数据）
const getCompletionPercentage = () => {
  return '0%'
}

// 获取剩余天数
const getRemainingDays = () => {
  if (!props.subproject?.endDate) return '-'

  const now = dayjs()
  const end = dayjs(props.subproject.endDate)
  const diff = end.diff(now, 'day')

  if (diff < 0) return '已截止'
  if (diff === 0) return '今日'
  return diff + '天'
}
</script>

<style scoped lang="scss">
.subproject-header {
  position: relative;
}

.breadcrumbs {
  margin-top: -8px;
}

.back-btn {
  transition: transform 0.2s ease;
  opacity: 0.8;

  &:hover {
    transform: translateX(-2px);
    opacity: 1;
  }
}

.subproject-color-indicator {
  width: 10px;
  height: 36px;
  border-radius: 4px;
}

.project-action-btn {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

// 项目信息卡片样式
.project-info-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.project-description {
  color: rgba(0, 0, 0, 0.75);
  line-height: 1.6;
}

.project-meta {
  &-item {
    margin-right: 2.5rem;
    margin-bottom: 0.5rem;
  }
}

// 状态卡片样式
.status-overview {
  @media (min-width: 960px) {
    border-left: 1px solid rgba(0, 0, 0, 0.08);
    padding-left: 2rem;
  }
}

.status-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;

  @media (min-width: 960px) {
    justify-content: flex-start;
  }
}

.status-card {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 80px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .status-value {
    font-size: 24px;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
    line-height: 1.2;
  }

  .status-label {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 4px;
  }
}
</style>
