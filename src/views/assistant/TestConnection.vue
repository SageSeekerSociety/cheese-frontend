<template>
  <div class="pa-4">
    <v-card>
      <v-card-title>ProjectMetis 连接测试</v-card-title>
      <v-card-text>
        <v-btn :loading="testing" color="primary" class="mb-4" @click="testConnection"> 测试连接 </v-btn>

        <v-textarea v-model="result" label="测试结果" readonly rows="10" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { assistantService } from '@/services/assistantService'

const testing = ref(false)
const result = ref('')

const testConnection = async () => {
  testing.value = true
  result.value = '开始测试连接...\n'

  try {
    // 测试创建用户
    result.value += '1. 测试用户创建...\n'
    const userId = await assistantService.ensureUser()
    result.value += `   用户ID: ${userId}\n`

    // 测试创建对话
    result.value += '2. 测试对话创建...\n'
    const conversationId = await assistantService.ensureConversation()
    result.value += `   对话ID: ${conversationId}\n`

    // 测试发送消息
    result.value += '3. 测试发送消息...\n'
    const stream = assistantService.sendMessage('你好，这是一个测试消息')
    let responseContent = ''

    for await (const chunk of stream) {
      if (chunk.type === 'delta') {
        responseContent += chunk.content
      } else if (chunk.type === 'complete') {
        result.value += `   收到完整响应: ${responseContent}\n`
        break
      } else if (chunk.type === 'error') {
        result.value += `   错误: ${chunk.content}\n`
        break
      }
    }

    // 测试获取记忆
    result.value += '4. 测试获取记忆...\n'
    const memories = await assistantService.getMemories()
    result.value += `   找到 ${memories.length} 条记忆\n`

    // 测试获取对话列表
    result.value += '5. 测试获取对话列表...\n'
    const conversations = await assistantService.getConversations()
    result.value += `   找到 ${conversations.length} 个对话\n`

    result.value += '✅ 所有测试通过！ProjectMetis连接成功。\n'
  } catch (error) {
    result.value += `❌ 测试失败: ${error}\n`
  } finally {
    testing.value = false
  }
}
</script>
