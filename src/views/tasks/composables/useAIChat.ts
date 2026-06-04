import type { TaskAIAdviceConversationContext } from '@/network/api/tasks/types'

import { provide, readonly, ref } from 'vue'

import { useEvents } from '../events'

export function useAIChat() {
  const selectedContext = ref<TaskAIAdviceConversationContext | undefined>()
  const events = useEvents()
  const chatDialogOpen = ref(false)

  events.on('chat-dialog-open', (value) => {
    chatDialogOpen.value = value.status
  })

  const clearContext = () => {
    selectedContext.value = undefined
  }

  const getDisplayName = (section: TaskAIAdviceConversationContext['section'], index: number) => {
    if (section === 'knowledge_fields') {
      return `知识领域 #${index + 1}`
    }
    if (section === 'learning_paths') {
      return `学习路径 #${index + 1}`
    }
    if (section === 'methodology') {
      return `方法论步骤 #${index + 1}`
    }
    if (section === 'team_tips') {
      return `团队角色 #${index + 1}`
    }
    return null
  }

  const openChat = (
    section: TaskAIAdviceConversationContext['section'],
    index: number,
    question?: string,
    displayName?: string
  ) => {
    selectedContext.value = {
      section,
      index,
      displayName: displayName || getDisplayName(section, index),
    }

    events.emit('chat-dialog-open', { status: true, question })
  }

  const openGeneralChat = () => {
    clearContext()
    events.emit('chat-dialog-open', { status: true })
  }

  // 提供对话方法给子组件
  provide('aiChat', {
    openChat: readonly(
      (section: TaskAIAdviceConversationContext['section'], index: number, question?: string, displayName?: string) =>
        openChat(section, index, question, displayName)
    ),
    openGeneralChat: readonly(openGeneralChat),
  })

  return {
    chatDialogOpen,
    selectedContext,
    clearContext,
    openChat,
    openGeneralChat,
  }
}
