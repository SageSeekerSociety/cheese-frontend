import { useI18n } from 'vue-i18n'

import { Task } from '@/types'

export const getTaskStatusText = (task?: Task | null) => {
  if (!task) return ''
  const { t } = useI18n()
  // if (task.submitterType === 'USER' && task.joined) return t('tasks.status.joined')
  // if (task.submitterType === 'TEAM' && task.joinedAsTeam?.length) return t('tasks.status.joined')
  if (task.approved === 'DISAPPROVED') return t('tasks.status.rejected')
  if (task.approved === 'NONE') return t('tasks.status.pending')
  if (task.deadline < Date.now()) return t('tasks.status.ended')
  return t('tasks.status.ongoing')
}

export const getTaskStatusType = (task?: Task | null) => {
  if (!task) return ''
  // if (task.submitterType === 'USER' && task.joined) return 'success'
  // if (task.submitterType === 'TEAM' && task.joinedAsTeam?.length) return 'success'
  if (task.approved === 'DISAPPROVED') return 'error'
  if (task.approved === 'NONE') return 'info'
  if (task.deadline < Date.now()) return 'error'
  return 'primary'
}
