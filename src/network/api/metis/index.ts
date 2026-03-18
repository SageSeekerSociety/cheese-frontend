import type { ChatMessage, ConversationSummary } from '@/components/chat/types'

import { SSE } from 'sse.js'

import { AI_API_BASE_URL } from '../../utils'
import { AiApiInstance } from '..'

import AccountService from '@/services/account'

export interface MetisConversationResponse {
  conversation_id: string
  user_id: string
  title: string
  created_at: string
}

type MetisMessageRole = 'user' | 'assistant' | 'tool' | 'USER' | 'ASSISTANT' | 'TOOL'

export interface MetisMessageResponse {
  message_id: string
  conversation_id: string
  parent_message_id?: string | null
  role: MetisMessageRole
  message_type: 'TEXT' | 'TOOL_CALL' | 'TOOL_RESULT'
  content: TextContent | ToolCallContent | ToolResultContent
  created_at: string
  message_metadata: Record<string, any>
  children?: MetisMessageResponse[] | null
}

// Content type definitions based on message_type
export interface TextContent {
  text: string
}

export interface ToolCallContent {
  tool_name?: string
  tool_input?: Record<string, any>
  name?: string
  args?: Record<string, any>
  arguments?: Record<string, any>
  id?: string
  tool_call_id?: string
}

export interface ToolResultContent {
  tool_name?: string
  result?: unknown
  name?: string
  output?: unknown
  tool_call_id?: string
}

export interface MetisConversationTree {
  conversation_id: string
  title: string
  messages: MetisMessageResponse[]
}

export interface MetisMemoryResponse {
  memory_id: string
  content: string
  created_at: string
  source_message_ids?: string[]
}

export interface MetisKnowledgeGraphEntity {
  entity_id: string
  name: string
  type: string
  properties: Record<string, any>
  created_at: string
}

export interface MetisMessageCreate {
  content: string
  parent_message_id?: string | null
  stream?: boolean
}

export namespace MetisApi {
  // users
  export const createUser = () =>
    AiApiInstance.request<{ user_id: string; created_at: string; profile_data: Record<string, any> }>({
      url: '/users/',
      method: 'POST',
      data: {},
    })

  export const getUserConversations = () =>
    AiApiInstance.request<MetisConversationResponse[]>({
      url: `/conversations`,
      method: 'GET',
    })

  export const getUserMemories = () =>
    AiApiInstance.request<MetisMemoryResponse[]>({
      url: `/memories`,
      method: 'GET',
    })

  // conversations
  export const createConversation = (title = '新对话') =>
    AiApiInstance.request<MetisConversationResponse>({
      url: '/conversations',
      method: 'POST',
      data: { title },
    })

  export const getConversationTree = (conversationId: string) =>
    AiApiInstance.request<MetisConversationTree>({
      url: `/conversations/${conversationId}`,
      method: 'GET',
    })

  // knowledge graph
  export const getKnowledgeGraphEntities = (userId: string, search?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (limit) params.append('limit', limit.toString())
    return AiApiInstance.request<MetisKnowledgeGraphEntity[]>({
      url: `/knowledge-graph/${userId}/entities`,
      method: 'GET',
      params,
    })
  }

  // messages (non-stream)
  export const sendMessage = (conversationId: string, data: MetisMessageCreate) =>
    AiApiInstance.request<MetisMessageResponse>({
      url: `/conversations/${conversationId}/messages`,
      method: 'POST',
      data: { ...data, stream: false },
    })

  // SSE 事件类型定义
  export interface SSEStartEvent {
    message_id: string
    parent_message_id: string
  }

  export interface SSEDeltaEvent {
    content: {
      text: string
    }
  }

  export interface SSEToolCallEvent {
    tool_name: string
    tool_input: Record<string, any>
    tool_call_id?: string
  }

  export interface SSEToolResultEvent {
    tool_name: string
    result: unknown
    tool_call_id?: string
  }

  export interface SSEEndEvent {
    message_id: string
  }

  export interface SSEErrorEvent {
    message: string
    message_id: string
  }

  export type SSEStreamEvent =
    | { type: 'start'; data: SSEStartEvent }
    | { type: 'delta'; data: SSEDeltaEvent }
    | { type: 'tool_call'; data: SSEToolCallEvent }
    | { type: 'tool_result'; data: SSEToolResultEvent }
    | { type: 'end'; data: SSEEndEvent }
    | { type: 'error'; data: SSEErrorEvent }

  // messages (stream via sse.js)
  export function streamMessage(
    conversationId: string,
    data: MetisMessageCreate,
    signal?: AbortSignal
  ): AsyncGenerator<SSEStreamEvent, void, unknown> {
    const stream = new ReadableStream<SSEStreamEvent>({
      start(controller) {
        const token = AccountService.accessToken
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const source = new SSE(`${AI_API_BASE_URL}/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers,
          payload: JSON.stringify({ ...data, stream: true }),
        })

        const onAbort = () => {
          try {
            controller.close()
          } catch (_) {
            // Ignore abort errors
          }
          source.close()
          signal?.removeEventListener('abort', onAbort)
        }
        if (signal) signal.addEventListener('abort', onAbort)

        // 处理 start 事件
        source.addEventListener('start', (e: any) => {
          try {
            const eventData = JSON.parse(e.data) as SSEStartEvent
            controller.enqueue({ type: 'start', data: eventData })
          } catch (err) {
            controller.error(err)
            source.close()
          }
        })

        // 处理 delta 事件
        source.addEventListener('delta', (e: any) => {
          try {
            // delta 事件的 data 是包含 content 字段的 JSON 对象
            const eventData = JSON.parse(e.data) as SSEDeltaEvent
            controller.enqueue({ type: 'delta', data: eventData })
          } catch (err) {
            controller.error(err)
            source.close()
          }
        })

        // 处理 tool_call 事件
        source.addEventListener('tool_call', (e: any) => {
          try {
            const eventData = JSON.parse(e.data) as SSEToolCallEvent
            controller.enqueue({ type: 'tool_call', data: eventData })
          } catch (err) {
            controller.error(err)
            source.close()
          }
        })

        // 处理 tool_result 事件
        source.addEventListener('tool_result', (e: any) => {
          try {
            const eventData = JSON.parse(e.data) as SSEToolResultEvent
            controller.enqueue({ type: 'tool_result', data: eventData })
          } catch (err) {
            controller.error(err)
            source.close()
          }
        })

        // 处理 end 事件
        source.addEventListener('end', (e: any) => {
          try {
            const eventData = JSON.parse(e.data) as SSEEndEvent
            controller.enqueue({ type: 'end', data: eventData })
            controller.close()
            source.close()
            if (signal) signal.removeEventListener('abort', onAbort)
          } catch (err) {
            controller.error(err)
            source.close()
          }
        })

        // 处理 error 事件
        source.addEventListener('error', (e: any) => {
          try {
            const eventData = JSON.parse(e.data) as SSEErrorEvent
            controller.enqueue({ type: 'error', data: eventData })
            controller.close()
            source.close()
            if (signal) signal.removeEventListener('abort', onAbort)
          } catch (err) {
            controller.error(new Error(`SSE error: ${e.data}`))
            source.close()
          }
        })

        source.stream()
      },
    })

    async function* generator() {
      const reader = stream.getReader()
      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    }
    return generator()
  }
}

// 提取消息内容的辅助函数
function extractContentText(content: TextContent | ToolCallContent | ToolResultContent, messageType: string): string {
  switch (messageType) {
    case 'TEXT':
      return (content as TextContent).text
    case 'TOOL_CALL': {
      const toolCall = content as ToolCallContent
      const toolName =
        toolCall.tool_name ??
        (toolCall.name as string | undefined) ??
        (toolCall.id as string | undefined) ??
        '未命名工具'
      return `[工具调用] ${toolName}`
    }
    case 'TOOL_RESULT': {
      const toolResult = content as ToolResultContent
      const toolName = toolResult.tool_name ?? (toolResult as unknown as { name?: string }).name ?? '未命名工具'
      const rawResult = toolResult.result ?? (toolResult as unknown as { output?: unknown }).output ?? ''
      let snippet = ''
      let truncated = false
      if (typeof rawResult === 'string') {
        snippet = rawResult.substring(0, 100)
        truncated = rawResult.length > snippet.length
      } else if (rawResult != null) {
        try {
          const serialised = JSON.stringify(rawResult)
          snippet = serialised.substring(0, 100)
          truncated = serialised.length > snippet.length
        } catch {
          snippet = String(rawResult).substring(0, 100)
          truncated = String(rawResult).length > snippet.length
        }
      }
      return snippet ? `[工具结果] ${toolName}: ${snippet}${truncated ? '...' : ''}` : `[工具结果] ${toolName}`
    }
    default:
      // 向后兼容性处理
      return typeof content === 'string' ? content : ''
  }
}

// helpers to adapt Metis messages to ChatMessage tree used by ChatDialog
export function adaptMetisMessagesWithMap(messages: MetisMessageResponse[]): {
  messages: ChatMessage[]
  uuidToNum: Map<string, number>
  numToUuid: Map<number, string>
  maxId: number
} {
  const uuidToNum = new Map<string, number>()
  const numToUuid = new Map<number, string>()
  let autoId = 1
  const getId = (uuid: string) => {
    if (!uuidToNum.has(uuid)) {
      uuidToNum.set(uuid, autoId)
      numToUuid.set(autoId, uuid)
      autoId += 1
    }
    return uuidToNum.get(uuid)!
  }

  const result: ChatMessage[] = []

  function walk(node: MetisMessageResponse, parentUuid?: string) {
    const id = getId(node.message_id)
    const parentId = parentUuid ? getId(parentUuid) : undefined
    const isUser = node.role === 'user'
    const contentText = extractContentText(node.content, node.message_type)
    const question = isUser ? contentText : ''
    const response = !isUser ? contentText : ''
    result.push({
      id,
      question,
      response,
      modelType: 'standard',
      followupQuestions: [],
      conversationId: node.conversation_id,
      parentId,
      createdAt: node.created_at,
    })

    if (node.children && node.children.length) {
      for (const child of node.children) walk(child, node.message_id)
    }
  }

  for (const m of messages) walk(m)
  return { messages: result, uuidToNum, numToUuid, maxId: autoId - 1 }
}

export function adaptMetisMessagesToChat(messages: MetisMessageResponse[]): ChatMessage[] {
  return adaptMetisMessagesWithMap(messages).messages
}

export function adaptMetisConversationsToSummary(list: MetisConversationResponse[]): ConversationSummary[] {
  return list.map((c) => ({
    conversationId: c.conversation_id,
    title: c.title,
    createdAt: c.created_at,
    updatedAt: c.created_at,
    messageCount: 0,
    latestMessage: null,
  }))
}
