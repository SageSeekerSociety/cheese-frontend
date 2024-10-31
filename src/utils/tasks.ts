import { useI18n } from 'vue-i18n'

import { Task } from '@/types'

export const getTaskStatusText = (task?: Task | null) => {
  if (!task) return ''
  const { t } = useI18n()
  if (!task.approved && task.rejectReason) return t('tasks.status.rejected')
  if (!task.approved) return t('tasks.status.pending')
  if (task.deadline < Date.now()) return t('tasks.status.ended')
  return t('tasks.status.ongoing')
}

export const getTaskStatusType = (task?: Task | null) => {
  if (!task) return ''
  if (!task.approved && task.rejectReason) return 'error'
  if (!task.approved) return 'info'
  if (task.deadline < Date.now()) return 'error'
  return 'primary'
}
