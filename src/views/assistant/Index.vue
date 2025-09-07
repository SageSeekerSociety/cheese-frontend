<template>
  <div class="chat-container d-flex flex-column h-100">
    <!-- 聊天头部 -->
    <!-- <v-toolbar flat class="bg-white">
      <v-toolbar-title class="d-flex align-center">
        <span>AI助手</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="showSettings = true">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-toolbar> -->

    <!-- 聊天内容区域 -->
    <div class="chat-content flex-grow-1 overflow-auto pa-4">
      <!-- 欢迎界面 -->
      <div v-if="messages.length === 0" class="welcome-container">
        <div class="text-center mb-8">
          <v-avatar size="80" class="mb-4">
            <v-icon icon="mdi-assistant" size="48" color="primary"></v-icon>
          </v-avatar>
          <h2 class="text-h4 font-weight-light mb-2">欢迎使用元思</h2>
          <p class="text-subtitle-1 text-medium-emphasis mb-6">你的第二个大脑，与你共同进化</p>
        </div>

        <!-- 快速操作建议 -->
        <!-- <v-row justify="center" class="mb-6">
          <v-col cols="12" sm="10" md="8">
            <v-card flat border>
              <v-card-text>
                <h3 class="text-h6 mb-4">快速开始</h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-btn
                      block
                      variant="outlined"
                      color="primary"
                      class="mb-2"
                      @click="sendQuickMessage('你好，请介绍一下你的功能')"
                    >
                      <v-icon start icon="mdi-hand-wave"></v-icon>
                      功能介绍
                    </v-btn>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-btn
                      block
                      variant="outlined"
                      color="primary"
                      class="mb-2"
                      @click="sendQuickMessage('帮我制定一个学习计划')"
                    >
                      <v-icon start icon="mdi-calendar-check"></v-icon>
                      学习规划
                    </v-btn>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-btn block variant="outlined" color="primary" @click="sendQuickMessage('分析一下我的项目进度')">
                      <v-icon start icon="mdi-chart-line"></v-icon>
                      项目分析
                    </v-btn>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-btn block variant="outlined" color="primary" @click="sendQuickMessage('帮我整理知识点')">
                      <v-icon start icon="mdi-file-document-multiple"></v-icon>
                      知识整理
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row> -->
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages-container">
        <ChatMessage v-for="message in messages" :key="message.id" :message="message" class="mb-4" />
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area pa-4 bg-white">
      <ChatInput v-model="inputMessage" :loading="isSending" @send="handleSendMessage" @stop="handleStopGeneration" />
    </div>

    <!-- 设置对话框 -->
    <v-dialog v-model="showSettings" max-width="500">
      <v-card>
        <v-card-title>AI助手设置</v-card-title>
        <v-card-text>
          <v-switch
            v-model="settings.enableMemory"
            label="启用长期记忆"
            hint="AI将记住我们之间的对话内容"
            persistent-hint
            class="mb-4"
          ></v-switch>
          <v-switch
            v-model="settings.enableKnowledgeGraph"
            label="启用知识图谱"
            hint="AI将构建和维护知识关系图"
            persistent-hint
            class="mb-4"
          ></v-switch>

          <v-divider class="my-4"></v-divider>

          <div class="mb-4">
            <h4 class="text-subtitle-1 mb-3">记忆管理</h4>
            <v-btn block variant="outlined" color="primary" class="mb-2" @click="openMemoryManagement">
              <v-icon start icon="mdi-brain"></v-icon>
              查看和管理记忆
            </v-btn>
          </div>

          <div>
            <h4 class="text-subtitle-1 mb-3">知识图谱</h4>
            <v-btn block variant="outlined" color="primary" @click="openKnowledgeGraph">
              <v-icon start icon="mdi-graph"></v-icon>
              查看知识图谱
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showSettings = false">关闭</v-btn>
          <v-btn color="primary" @click="saveSettings">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import ChatInput from '@/components/assistant/ChatInput.vue'
import ChatMessage from '@/components/assistant/ChatMessage.vue'
import { type AssistantMessage, assistantService } from '@/services/assistantService'

// 数据
const inputMessage = ref('')
const isSending = ref(false)
const isTyping = ref(false)
let currentAbortController: AbortController | null = null
const showSettings = ref(false)

// 设置
const settings = ref({
  enableMemory: true,
  enableKnowledgeGraph: true,
})

// 消息列表
const messages = ref<AssistantMessage[]>([
  // 示例消息数据
])

// 发送消息
const handleSendMessage = async (message: string) => {
  if (!message.trim() || isSending.value) return

  // 添加用户消息
  const userMessage: AssistantMessage = {
    id: Date.now().toString(),
    role: 'user' as const,
    messageType: 'TEXT' as const,
    content: message,
    timestamp: new Date(),
  }
  messages.value.push(userMessage)

  // 清空输入
  inputMessage.value = ''
  isSending.value = true
  isTyping.value = true

  // 创建AI响应消息占位符
  const aiMessage: AssistantMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant' as const,
    messageType: 'TEXT' as const,
    content: '',
    timestamp: new Date(),
    isTyping: true,
  }
  messages.value.push(aiMessage)

  try {
    // 调用ProjectMetis API进行流式响应（支持停止生成）
    currentAbortController = new AbortController()
    const stream = assistantService.sendMessage(message, { signal: currentAbortController.signal })
    let fullContent = ''

    for await (const chunk of stream) {
      if (chunk.type === 'delta') {
        fullContent += chunk.content
        // 更新AI消息内容
        const aiMsgIndex = messages.value.findIndex((m) => m.id === aiMessage.id)
        if (aiMsgIndex !== -1) {
          messages.value[aiMsgIndex].content = fullContent
        }
        // 滚动到底部
        await nextTick()
        scrollToBottom()
      } else if (chunk.type === 'complete') {
        // 完成响应
        const aiMsgIndex = messages.value.findIndex((m) => m.id === aiMessage.id)
        if (aiMsgIndex !== -1) {
          messages.value[aiMsgIndex].content = fullContent
          messages.value[aiMsgIndex].isTyping = false
        }
        break
      } else if (chunk.type === 'error') {
        // 错误处理
        const aiMsgIndex = messages.value.findIndex((m) => m.id === aiMessage.id)
        if (aiMsgIndex !== -1) {
          messages.value[aiMsgIndex].content = '抱歉，处理您的请求时出现了错误：' + chunk.content
          messages.value[aiMsgIndex].isTyping = false
        }
        break
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    // 更新AI消息显示错误
    const aiMsgIndex = messages.value.findIndex((m) => m.id === aiMessage.id)
    if (aiMsgIndex !== -1) {
      messages.value[aiMsgIndex].content = '抱歉，发送消息时出现了错误。请稍后重试。'
      messages.value[aiMsgIndex].isTyping = false
    }
  } finally {
    isSending.value = false
    isTyping.value = false
    currentAbortController = null
  }
}

// 快速发送消息
const sendQuickMessage = (message: string) => {
  inputMessage.value = message
  handleSendMessage(message)
}

// 停止生成
const handleStopGeneration = () => {
  if (currentAbortController) {
    try {
      currentAbortController.abort()
    } catch (e) {
      console.error('停止生成时出错:', e)
    }
    currentAbortController = null
  }
  isSending.value = false
  isTyping.value = false
}

// 滚动到底部
const scrollToBottom = () => {
  const chatContent = document.querySelector('.chat-content')
  if (chatContent) {
    chatContent.scrollTop = chatContent.scrollHeight
  }
}

// 加载对话历史
const loadConversationHistory = async () => {
  try {
    const history = await assistantService.loadConversationHistory()
    messages.value = history
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('加载对话历史失败:', error)
  }
}

// 组件挂载时加载历史
onMounted(() => {
  loadConversationHistory()
})

// 保存设置
const saveSettings = () => {
  // TODO: 保存设置到后端
  showSettings.value = false
}

// 打开记忆管理
const openMemoryManagement = () => {
  showSettings.value = false
  // 导航到记忆管理页面
  window.open('/assistant/memory', '_blank')
}

// 打开知识图谱
const openKnowledgeGraph = () => {
  showSettings.value = false
  // 导航到知识图谱页面
  window.open('/assistant/knowledge-graph', '_blank')
}
</script>

<style scoped>
.welcome-container {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 2rem;
}

.messages-container {
  max-width: 800px;
  margin: 0 auto;
}

.typing-indicator {
  opacity: 0.7;
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
