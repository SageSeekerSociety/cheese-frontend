import type { AnalyticsApproveType, AnalyticsCompletionType } from '@/network/api/spaces/types'
import type { TaskSubmitterType } from '@/types'

import dayjs from 'dayjs'

export const formatCount = (value?: null | number) => new Intl.NumberFormat('zh-CN').format(value || 0)

export const formatPercent = (value?: null | number, digits = 1) => `${((value || 0) * 100).toFixed(digits)}%`

export const formatDateTime = (value?: null | number) => {
  if (!value) return '暂无'
  return dayjs(value).format('YYYY-MM-DD HH:mm')
}

export const formatDate = (value?: null | number) => {
  if (!value) return '暂无'
  return dayjs(value).format('YYYY-MM-DD')
}

export const formatDeadline = (value?: null | number) => {
  if (!value) return '无截止时间'

  const now = dayjs()
  const deadline = dayjs(value)
  const diffDays = deadline.startOf('day').diff(now.startOf('day'), 'day')

  if (diffDays < 0) return `已于 ${deadline.format('MM-DD')} 截止`
  if (diffDays === 0) return '今日截止'
  if (diffDays === 1) return '明日截止'
  if (diffDays < 7) return `${diffDays} 天后截止`
  return deadline.format('MM-DD 截止')
}

export const approvalText = (value: AnalyticsApproveType) => {
  if (value === 'APPROVED') return '已通过'
  if (value === 'DISAPPROVED') return '未通过'
  return '待审核'
}

export const approvalColor = (value: AnalyticsApproveType) => {
  if (value === 'APPROVED') return 'success'
  if (value === 'DISAPPROVED') return 'error'
  return 'warning'
}

export const completionText = (value: AnalyticsCompletionType) => {
  if (value === 'SUCCESS') return '已成功'
  if (value === 'FAILED') return '未完成'
  if (value === 'PENDING_REVIEW') return '待评审'
  if (value === 'REJECTED_RESUBMITTABLE') return '可重提'
  return '待提交'
}

export const completionColor = (value: AnalyticsCompletionType) => {
  if (value === 'SUCCESS') return 'success'
  if (value === 'FAILED') return 'error'
  if (value === 'PENDING_REVIEW') return 'info'
  if (value === 'REJECTED_RESUBMITTABLE') return 'warning'
  return 'secondary'
}

export const identityText = (value: TaskSubmitterType) => (value === 'TEAM' ? '团队参与' : '个人参与')
