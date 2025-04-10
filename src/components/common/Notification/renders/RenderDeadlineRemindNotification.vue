<template>
  <div class="notification-content">
    <div class="text-subtitle-2 font-weight-medium">{{ title }}</div>
    <div class="text-body-2 text-medium-emphasis mt-1">{{ body }}</div>
    <div class="deadline-box mt-2">
      <div class="d-flex align-center">
        <v-icon icon="mdi-calendar-clock" size="16" class="me-2" :color="deadlineColor" />
        <span class="text-body-2" :class="deadlineTextClass">{{ formattedDeadlineDate }}</span>
      </div>
      <div v-if="daysLeft !== null" class="mt-1 d-flex align-center">
        <v-progress-linear :model-value="progress" :color="deadlineColor" height="4" rounded></v-progress-linear>
        <span class="text-caption ms-2" :class="deadlineTextClass">{{ daysLeftText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationRenderProps, RenderedNotificationContent } from './NotificationRenderUtils'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

import { getEntity, getMetadata, getStringMetadata } from './NotificationRenderUtils'

const props = defineProps<NotificationRenderProps>()
const { t } = useI18n()

// 获取实体和元数据
const project = computed(() => getEntity(props.notification, 'project'))
const projectName = computed(() => getStringMetadata(props.notification, 'projectName', project.value?.name || ''))
const deadlineTimestamp = computed(() => getMetadata<number>(props.notification, 'deadlineTimestamp', 0))
const daysLeft = computed(() => getMetadata<number | null>(props.notification, 'daysLeft', null))

// 计算截止日期的格式化显示
const formattedDeadlineDate = computed(() => {
  if (!deadlineTimestamp.value) return ''
  return dayjs(deadlineTimestamp.value).format('YYYY年MM月DD日 HH:mm')
})

// 计算剩余天数的显示文本
const daysLeftText = computed(() => {
  if (daysLeft.value === null) return ''
  if (daysLeft.value <= 0) return '已截止'
  if (daysLeft.value < 1) return '今天截止'
  return `剩余 ${daysLeft.value} 天`
})

// 计算进度条的值
const progress = computed(() => {
  if (daysLeft.value === null || daysLeft.value < 0) return 100
  if (daysLeft.value > 30) return 10
  return 100 - (daysLeft.value / 30) * 100
})

// 根据剩余天数确定颜色
const deadlineColor = computed(() => {
  if (daysLeft.value === null) return 'grey'
  if (daysLeft.value <= 0) return 'error'
  if (daysLeft.value <= 3) return 'error'
  if (daysLeft.value <= 7) return 'warning'
  return 'success'
})

// 根据剩余天数确定文本样式
const deadlineTextClass = computed(() => {
  if (daysLeft.value === null) return 'text-medium-emphasis'
  if (daysLeft.value <= 0) return 'text-error'
  if (daysLeft.value <= 3) return 'text-error'
  if (daysLeft.value <= 7) return 'text-warning'
  return 'text-success'
})

// 通知标题
const title = computed(() => {
  return t('notifications.DEADLINE_REMIND.title')
})

// 通知内容
const body = computed(() => {
  return t('notifications.DEADLINE_REMIND.body', {
    projectName: projectName.value || t('notifications.common.unknownProject'),
    daysLeft: daysLeft.value,
  })
})

// 构建路由链接
const routerLink = computed(() => {
  if (project.value) {
    return {
      name: 'ProjectDetail',
      params: { id: project.value.id },
      query: { tab: 'schedule' },
    }
  }
  return undefined
})

// 导出渲染结果，供父组件使用
const content = computed<RenderedNotificationContent>(() => ({
  title: title.value,
  body: body.value,
  routerLink: routerLink.value,
}))

defineExpose({
  content,
})
</script>

<style scoped>
.notification-content {
  display: flex;
  flex-direction: column;
}

.deadline-box {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  padding: 10px 12px;
  position: relative;
}
</style>
