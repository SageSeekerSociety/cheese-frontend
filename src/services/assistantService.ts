import type { AssistantMessage, AssistantStreamEvent, StreamMessageOptions } from '@/types/assistant'

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

const normalizeMessageRole = (role: MetisMessageResponse['role']): 'user' | 'assistant' => {
  const lowered = role.toString().toLowerCase()
  return lowered === 'user' ? 'user' : 'assistant'
}

const getToolCallInfo = (
  content: ToolCallContent | ToolResultContent
): {
  name: string
  input?: Record<string, any>
  result?: unknown
  callId?: string
} => {
  const maybeAny = content as Record<string, any>
  const name =
    content.tool_name ?? (maybeAny.name as string | undefined) ?? (maybeAny.id as string | undefined) ?? 'Unknown Tool'
  const input =
    (maybeAny.tool_input as Record<string, any> | undefined) ||
    (maybeAny.args as Record<string, any> | undefined) ||
    (maybeAny.arguments as Record<string, any> | undefined)
  const callId =
    (maybeAny.tool_call_id as string | undefined) ??
    (maybeAny.id as string | undefined) ??
    (maybeAny.call_id as string | undefined)
  const result =
    maybeAny.result !== undefined
      ? maybeAny.result
      : maybeAny.output !== undefined
        ? maybeAny.output
        : maybeAny.data !== undefined
          ? maybeAny.data
          : undefined
  return { name, input, result, callId }
}

const isFinalAnswerTool = (name?: string) => (name ?? '').toLowerCase() === 'final_answer'

const shouldHideMessage = (msg: MetisMessageResponse): boolean => {
  if (msg.message_type !== 'TOOL_CALL') return false
  const { name } = getToolCallInfo(msg.content as ToolCallContent)
  return isFinalAnswerTool(name)
}

type AssistantPhase = 'preface' | 'body'

interface AssistantAggregation {
  message: AssistantMessage
  phase: AssistantPhase
}

const createAssistantAggregation = (seed: MetisMessageResponse): AssistantAggregation => ({
  message: {
    id: seed.message_id,
    role: 'assistant',
    messageType: 'TEXT',
    content: '',
    parts: [],
    timestamp: new Date(seed.created_at),
    isTyping: false,
  },
  phase: 'preface',
})

export interface AssistantSettings {
  enableMemory: boolean
  enableKnowledgeGraph: boolean
}

export class AssistantService {
  private getUserId(): string {
    const userId = AccountService.user?.id
    if (!userId) {
      throw new Error('User not authenticated. Cannot perform assistant operations.')
    }
    return userId.toString()
  }

  private flattenMessageTree(messages: MetisMessageResponse[]): MetisMessageResponse[] {
    const result: MetisMessageResponse[] = []

    const traverse = (nodes: MetisMessageResponse[]) => {
      for (const node of nodes) {
        result.push(node)
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      }
    }

    traverse(messages)
    return result
  }

  async createConversation(title = '新对话'): Promise<string> {
    const conversation = await MetisApi.createConversation(title)
    return conversation.data.conversation_id
  }

  async loadConversationMessages(conversationId: string): Promise<AssistantMessage[]> {
    try {
      const tree = await MetisApi.getConversationTree(conversationId)
      const flatMessages = this.flattenMessageTree(tree.data.messages).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      const output: AssistantMessage[] = []
      let aggregation: AssistantAggregation | null = null

      const flushAggregation = () => {
        if (!aggregation) return
        const { message } = aggregation
        message.meta = {
          toolCount: message.parts?.filter((part) => part.kind === 'tool').length ?? 0,
          hasThinking: message.parts?.some((part) => part.kind === 'thinking') ?? false,
        }
        output.push(message)
        aggregation = null
      }

      for (const msg of flatMessages) {
        if (shouldHideMessage(msg)) continue
        const role = normalizeMessageRole(msg.role)

        if (role === 'user') {
          flushAggregation()
          const text = msg.message_type === 'TEXT' ? (msg.content as TextContent).text : ''
          output.push({
            id: msg.message_id,
            role: 'user',
            messageType: 'TEXT',
            content: text,
            timestamp: new Date(msg.created_at),
          })
          continue
        }

        if (!aggregation) {
          aggregation = createAssistantAggregation(msg)
        }

        const ts = new Date(msg.created_at).getTime()
        const message = aggregation.message
        const parts = message.parts ?? (message.parts = [])

        switch (msg.message_type) {
          case 'TEXT': {
            const text = (msg.content as TextContent).text ?? ''
            if (text) {
              if (aggregation.phase === 'preface') aggregation.phase = 'body'
              const last = parts[parts.length - 1]
              if (last && last.kind === 'text') {
                last.text += text
                last.ts = ts
              } else {
                parts.push({ kind: 'text', text, ts })
              }
              message.content = `${message.content ?? ''}${text}`
              message.id = msg.message_id
            }
            break
          }
          case 'TOOL_CALL': {
            const { name, input, callId } = getToolCallInfo(msg.content as ToolCallContent)
            parts.push({
              kind: 'tool',
              id: msg.message_id,
              name,
              input,
              callId: callId ?? undefined,
              status: 'calling',
              phase: aggregation.phase === 'preface' ? 'preface' : 'inline',
              ts,
            })
            break
          }
          case 'TOOL_RESULT': {
            const { name, result, callId } = getToolCallInfo(msg.content as ToolResultContent)
            let matched = false
            for (let i = parts.length - 1; i >= 0; i -= 1) {
              const part = parts[i]
              if (
                part.kind === 'tool' &&
                part.status === 'calling' &&
                ((callId && part.callId === callId) || (!callId && part.name === name))
              ) {
                part.status = 'success'
                part.result = result
                if (callId && !part.callId) part.callId = callId
                part.ts = ts
                matched = true
                break
              }
            }
            if (!matched) {
              parts.push({
                kind: 'tool',
                id: msg.message_id,
                name,
                result,
                callId: callId ?? undefined,
                status: 'success',
                phase: aggregation.phase === 'preface' ? 'preface' : 'inline',
                ts,
              })
            }
            break
          }
        }

        message.timestamp = new Date(msg.created_at)
      }

      flushAggregation()
      return output
    } catch (error) {
      console.error('加载对话失败:', error)
      return []
    }
  }

  async *streamConversationMessage(
    conversationId: string,
    options: StreamMessageOptions
  ): AsyncGenerator<AssistantStreamEvent> {
    try {
      const stream = MetisApi.streamMessage(
        conversationId,
        {
          content: options.message,
          parent_message_id: options.parentMessageId ?? undefined,
          stream: true,
        },
        options.signal
      )

      let currentMessageId: string | undefined
      let fullContent = ''

      for await (const event of stream) {
        switch (event.type) {
          case 'start':
            currentMessageId = event.data.message_id
            yield {
              type: 'start',
              messageId: currentMessageId,
              parentMessageId: event.data.parent_message_id,
            }
            break
          case 'delta': {
            const chunk = event.data.content.text ?? ''
            if (chunk) {
              fullContent += chunk
              yield { type: 'delta', content: chunk, messageId: currentMessageId }
            }
            break
          }
          case 'tool_call': {
            const toolName = event.data.tool_name ?? ''
            if (isFinalAnswerTool(toolName)) continue
            yield {
              type: 'tool_call',
              messageId: currentMessageId,
              toolName,
              toolInput: event.data.tool_input,
              toolCallId: event.data.tool_call_id,
            }
            break
          }
          case 'tool_result': {
            const toolName = event.data.tool_name ?? ''
            if (isFinalAnswerTool(toolName)) continue
            yield {
              type: 'tool_result',
              messageId: currentMessageId,
              toolName,
              toolResult: event.data.result,
              toolCallId: event.data.tool_call_id,
            }
            break
          }
          case 'end':
            yield {
              type: 'complete',
              content: fullContent || undefined,
              messageId: currentMessageId ?? event.data.message_id,
            }
            break
          case 'error':
            yield {
              type: 'error',
              content: event.data.message ?? '发送消息失败',
              messageId: currentMessageId ?? event.data.message_id,
            }
            break
        }
      }
    } catch (error) {
      yield { type: 'error', content: error instanceof Error ? error.message : '发送消息失败' }
    }
  }

  async startNewConversation(title = '新对话'): Promise<string> {
    return this.createConversation(title)
  }

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
        importance: 'medium',
        createdAt: new Date(memory.created_at),
        accessCount: 0,
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

  private extractTitleFromContent(content: string): string {
    const title = content.trim().substring(0, 30)
    return title.length < content.length ? `${title}...` : title
  }

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

export const assistantService = new AssistantService()
