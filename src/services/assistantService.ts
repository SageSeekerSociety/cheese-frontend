import AccountService from './account'

import {
  MetisApi,
  type MetisConversationResponse,
  type MetisMemoryResponse,
  type MetisMessageResponse,
  type TextContent,
  type ToolCallContent,
  type ToolResultContent,
} from '@/network/api/metis'

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  messageType: 'TEXT' | 'TOOL_CALL' | 'TOOL_RESULT'
  content: string
  timestamp: Date
  isTyping?: boolean
  toolName?: string
  toolInput?: Record<string, any>
  toolResult?: string
}

export interface AssistantSettings {
  enableMemory: boolean
  enableKnowledgeGraph: boolean
}

export class AssistantService {
  private currentConversationId: string | null = null

  private getUserId(): string {
    const userId = AccountService.user?.id
    if (!userId) {
      throw new Error('User not authenticated. Cannot perform assistant operations.')
    }
    return userId.toString()
  }

  async ensureConversation(): Promise<string> {
    if (this.currentConversationId) return this.currentConversationId

    const conversation = await MetisApi.createConversation('AI助手对话')
    this.currentConversationId = conversation.data.conversation_id
    return this.currentConversationId
  }

  async *sendMessage(
    content: string,
    options?: { signal?: AbortSignal }
  ): AsyncGenerator<{
    type: 'start' | 'delta' | 'tool_call' | 'tool_result' | 'complete' | 'error'
    content: string
    messageId?: string
    parentMessageId?: string
    toolName?: string
    toolInput?: Record<string, any>
    toolResult?: string
  }> {
    try {
      const conversationId = await this.ensureConversation()

      // 获取当前对话最后一条消息作为parent_message_id（若存在）
      let parentMessageId: string | undefined
      try {
        const tree = await MetisApi.getConversationTree(conversationId)
        const flat = this.flattenMessageTree(tree.data.messages)
        if (flat.length > 0) {
          flat.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          parentMessageId = flat[flat.length - 1].message_id
        }
      } catch (e) {
        // 忽略获取父消息失败，按无parent发送
      }

      const stream = MetisApi.streamMessage(
        conversationId,
        {
          content,
          parent_message_id: parentMessageId,
          stream: true,
        },
        options?.signal
      )

      let fullContent = ''
      let currentMessageId: string | undefined

      for await (const event of stream) {
        switch (event.type) {
          case 'start':
            currentMessageId = event.data.message_id
            yield {
              type: 'start',
              content: '',
              messageId: event.data.message_id,
              parentMessageId: event.data.parent_message_id,
            }
            break

          case 'delta':
            fullContent += event.data.content
            yield {
              type: 'delta',
              content: event.data.content,
              messageId: currentMessageId,
            }
            break

          case 'tool_call':
            yield {
              type: 'tool_call',
              content: `正在使用工具: ${event.data.tool_name}`,
              messageId: currentMessageId,
              toolName: event.data.tool_name,
              toolInput: event.data.tool_input,
            }
            break

          case 'tool_result':
            yield {
              type: 'tool_result',
              content: `工具执行完成: ${event.data.tool_name}`,
              messageId: currentMessageId,
              toolName: event.data.tool_name,
              toolResult: event.data.result,
            }
            break

          case 'end':
            yield {
              type: 'complete',
              content: fullContent,
              messageId: event.data.message_id,
            }
            break

          case 'error':
            yield {
              type: 'error',
              content: event.data.message,
              messageId: event.data.message_id,
            }
            break
        }
      }
    } catch (error) {
      yield {
        type: 'error',
        content: error instanceof Error ? error.message : '发送消息失败',
      }
    }
  }

  async loadConversationHistory(): Promise<AssistantMessage[]> {
    try {
      if (!this.currentConversationId) return []

      const tree = await MetisApi.getConversationTree(this.currentConversationId)

      // 将Metis消息转换为助手消息格式
      const messages: AssistantMessage[] = []

      // 简单的消息排序，按创建时间
      const flatMessages = this.flattenMessageTree(tree.data.messages)
      flatMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      for (const msg of flatMessages) {
        const content = this.extractMessageContent(msg)
        const assistantMessage: AssistantMessage = {
          id: msg.message_id,
          role: msg.role,
          messageType: msg.message_type,
          content,
          timestamp: new Date(msg.created_at),
        }

        // 为工具调用和工具结果添加额外信息
        if (msg.message_type === 'TOOL_CALL') {
          const toolCall = msg.content as ToolCallContent
          assistantMessage.toolName = toolCall.tool_name
          assistantMessage.toolInput = toolCall.tool_input
        } else if (msg.message_type === 'TOOL_RESULT') {
          const toolResult = msg.content as ToolResultContent
          assistantMessage.toolName = toolResult.tool_name
          assistantMessage.toolResult = toolResult.result
        }

        messages.push(assistantMessage)
      }

      return messages
    } catch (error) {
      console.error('加载对话历史失败:', error)
      return []
    }
  }

  // 根据消息类型提取内容
  private extractMessageContent(msg: MetisMessageResponse): string {
    switch (msg.message_type) {
      case 'TEXT':
        return (msg.content as TextContent).text
      case 'TOOL_CALL': {
        const toolCall = msg.content as ToolCallContent
        return `[工具调用] ${toolCall.tool_name}`
      }
      case 'TOOL_RESULT': {
        const toolResult = msg.content as ToolResultContent
        return `[工具结果] ${toolResult.tool_name}: ${toolResult.result.substring(0, 100)}...`
      }
      default:
        // 向后兼容性处理
        return typeof msg.content === 'string' ? msg.content : ''
    }
  }

  private flattenMessageTree(messages: MetisMessageResponse[]): MetisMessageResponse[] {
    const result: MetisMessageResponse[] = []

    function traverse(msgs: MetisMessageResponse[]) {
      for (const msg of msgs) {
        result.push(msg)
        if (msg.children && msg.children.length > 0) {
          traverse(msg.children)
        }
      }
    }

    traverse(messages)
    return result
  }

  // 清除当前对话，开始新对话
  async startNewConversation(): Promise<void> {
    this.currentConversationId = null
  }

  // 获取用户的记忆列表
  async getMemories(): Promise<
    Array<{
      id: string
      title: string
      content: string
      category: string
      importance: string
      createdAt: Date
      accessCount: number
      sourceMessages: Array<{
        id: string
        conversationTitle: string
      }>
    }>
  > {
    this.getUserId()
    try {
      const memories = await MetisApi.getUserMemories()
      return memories.data.map((memory: MetisMemoryResponse) => ({
        id: memory.memory_id,
        title: this.extractTitleFromContent(memory.content),
        content: memory.content,
        category: this.mapCategory(memory.content),
        importance: 'medium', // ProjectMetis没有重要性字段，默认为中等
        createdAt: new Date(memory.created_at),
        accessCount: 0, // ProjectMetis没有访问计数，默认为0
        sourceMessages: memory.source_message_ids
          ? memory.source_message_ids.map((id: string) => ({
              id,
              conversationTitle: '相关对话',
            }))
          : [],
      }))
    } catch (error) {
      console.error('获取记忆失败:', error)
      return []
    }
  }

  // 从内容中提取标题
  private extractTitleFromContent(content: string): string {
    // 取前30个字符作为标题
    const title = content.trim().substring(0, 30)
    return title.length < content.length ? title + '...' : title
  }

  // 根据内容映射分类
  private mapCategory(content: string): string {
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes('偏好') || lowerContent.includes('喜欢') || lowerContent.includes('preference')) {
      return 'preferences'
    }
    if (lowerContent.includes('目标') || lowerContent.includes('计划') || lowerContent.includes('任务')) {
      return 'goals_tasks'
    }
    if (lowerContent.includes('知识') || lowerContent.includes('技术') || lowerContent.includes('学习')) {
      return 'knowledge_domain'
    }
    if (lowerContent.includes('身份') || lowerContent.includes('角色') || lowerContent.includes('职业')) {
      return 'identity_role'
    }
    return 'uncategorized'
  }

  // 获取用户对话列表
  async getConversations() {
    this.getUserId()
    try {
      const conversations = await MetisApi.getUserConversations()
      return conversations.data.map((conv: MetisConversationResponse) => ({
        id: conv.conversation_id,
        title: conv.title || '未命名对话',
        lastActivity: new Date(conv.created_at),
      }))
    } catch (error) {
      console.error('获取对话列表失败:', error)
      return []
    }
  }

  // 获取知识图谱实体
  async getKnowledgeGraphEntities(search?: string) {
    const userId = this.getUserId()
    try {
      const entities = await MetisApi.getKnowledgeGraphEntities(userId, search)
      return entities.data
    } catch (error) {
      console.error('获取知识图谱实体失败:', error)
      return []
    }
  }
}

// 单例实例
export const assistantService = new AssistantService()
