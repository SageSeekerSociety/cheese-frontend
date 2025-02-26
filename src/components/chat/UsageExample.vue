<template>
  <div>
    <v-btn color="primary" @click="showChat = true">
      <v-icon left>mdi-chat</v-icon>
      打开AI助手对话
    </v-btn>

    <ChatDialog
      v-model="showChat"
      :context-id="taskId"
      :context="taskContext"
      :chat-service="chatService"
      title="AI助手"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChatContext } from './types'

import { onMounted, ref } from 'vue'

import { ChatDialog, TaskAIAdviceChatService } from './index'

// 对话框状态
const showChat = ref(false)
const taskId = ref(123) // 这里应该是实际任务的ID

// 创建任务上下文
const taskContext = ref<ChatContext>({
  title: '示例任务标题',
  description: '这是一个示例任务描述，用于演示聊天组件的使用。',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // 其他可能的任务相关信息
})

// 创建聊天服务实例
const chatService = new TaskAIAdviceChatService()

// 在组件挂载时可以执行一些初始化逻辑
onMounted(() => {
  console.log('组件已挂载，可以执行一些初始化逻辑')
})

// 也可以定义直接暴露给父组件的方法
const openChatWithQuestion = (question: string) => {
  showChat.value = true
  // 这里可以等待对话框完全打开后再发送问题
  setTimeout(() => {
    // 获取ChatDialog组件实例上的sendMessage方法
    // 这里需要通过组件实例调用，此处仅为说明
    // chatDialogRef.value?.sendMessage(question)
  }, 500)
}

// 向父组件暴露方法
defineExpose({
  openChatWithQuestion,
})
</script>
