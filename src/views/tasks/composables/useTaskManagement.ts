import type { PatchTaskRequestData } from '@/network/api/tasks/types'
import type { useTaskData } from './useTaskData'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'

import { useEvents } from '../events'

import { TasksApi } from '@/network/api/tasks'
import { useDialog } from '@/plugins/dialog'
export function useTaskManagement(taskDataModule: ReturnType<typeof useTaskData>) {
  const { taskData, loadTaskData } = taskDataModule
  const router = useRouter()
  const dialogs = useDialog()
  const events = useEvents()

  const openEditDialog = () => {
    events.emit('edit-dialog-open', true)
  }

  const submitEditTask = async (updatedTaskData: PatchTaskRequestData) => {
    if (!taskData.value) return

    try {
      await TasksApi.update(taskData.value.id, updatedTaskData)
      toast.success('赛题更新成功')
      events.emit('edit-dialog-open', false)
      await loadTaskData()
    } catch (error) {
      toast.error('更新失败')
      console.error('更新失败', error)
    }
  }

  const confirmDeleteTask = async () => {
    if (!taskData.value) return

    const confirmed = await dialogs
      .confirm('确定要删除该赛题吗？该操作不可撤销。', {
        title: '确认删除',
      })
      .wait()

    if (confirmed) {
      try {
        await TasksApi.del(taskData.value.id)
        toast.success('赛题已删除')
        router.replace({ name: 'HomeDefault' })
      } catch (error) {
        toast.error('删除失败')
      }
    }
  }

  return {
    openEditDialog,
    submitEditTask,
    confirmDeleteTask,
  }
}
