<template>
  <ChatDialog
    ref="chatDialogRef"
    v-model="dialogOpen"
    :context-id="taskId"
    :context="context"
    :chat-service="chatService"
    title="启星智询 Converse AI"
    @clear-context="clearContext"
  />
</template>

<script setup lang="ts">
import type { TaskAIAdviceConversationContext } from '@/network/api/tasks/types'

import { ref, toRefs } from 'vue'

import { ChatDialog, TaskAIAdviceChatService } from '@/components/chat'

const props = defineProps<{
  taskId: number
  context?: TaskAIAdviceConversationContext
}>()

const { taskId, context } = toRefs(props)

const dialogOpen = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  clearContext: []
}>()

const clearContext = () => {
  emit('clearContext')
}

// 创建聊天服务实例
const chatService = new TaskAIAdviceChatService()

// 添加对 ChatDialog 组件的引用
const chatDialogRef = ref<InstanceType<typeof ChatDialog> | null>(null)

// 暴露方法给父组件使用
defineExpose({
  sendMessage: (question: string) => {
    // 确保对话框已打开
    dialogOpen.value = true

    // 使用 nextTick 确保对话框已完全打开后再发送消息
    setTimeout(() => {
      if (chatDialogRef.value) {
        console.log('sendMessage', question, context.value)
        chatDialogRef.value.sendMessage(question)
      }
    }, 300)
  },
})
</script>
