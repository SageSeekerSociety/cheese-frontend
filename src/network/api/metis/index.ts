import type { ChatMessage, ConversationSummary } from '@/components/chat/types'

export interface MetisConversationResponse {
  conversation_id: string
  user_id: string
  title: string
  created_at: string
}

export interface MetisMessageResponse {
  message_id: string
  conversation_id: string
  parent_message_id?: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  message_metadata: Record<string, any>
  children?: MetisMessageResponse[] | null
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

const API_BASE = '/api'

async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

export const MetisApi = {
  // users
  createUser: async () =>
    json<{ user_id: string; created_at: string; profile_data: Record<string, any> }>(`${API_BASE}/users/`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  getUserConversations: async (userId: string) =>
    json<MetisConversationResponse[]>(`${API_BASE}/users/${userId}/conversations`),
  getUserMemories: async (userId: string) => json<MetisMemoryResponse[]>(`${API_BASE}/users/${userId}/memories`),

  // conversations
  createConversation: async (userId: string, title = '新对话') =>
    json<MetisConversationResponse>(`${API_BASE}/conversations/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, title }),
    }),
  getConversationTree: async (conversationId: string) =>
    json<MetisConversationTree>(`${API_BASE}/conversations/${conversationId}`),

  // knowledge graph
  getKnowledgeGraphEntities: async (userId: string, search?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (limit) params.append('limit', limit.toString())
    const queryString = params.toString()
    const url = `${API_BASE}/knowledge-graph/${userId}/entities${queryString ? `?${queryString}` : ''}`
    return json<MetisKnowledgeGraphEntity[]>(url)
  },

  // messages (non-stream)
  sendMessage: async (conversationId: string, data: MetisMessageCreate) =>
    json<MetisMessageResponse>(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ ...data, stream: false }),
    }),

  // messages (stream via SSE-like chunked fetch)
  streamMessage: async function* (
    conversationId: string,
    data: MetisMessageCreate
  ): AsyncGenerator<
    { delta: string; message_id?: string; parent_message_id?: string | null; finished?: boolean },
    void,
    unknown
  > {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, stream: true }),
    })
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const evt = JSON.parse(line.slice(6))
              yield evt
              if (evt.finished) return
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },
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
    const question = isUser ? node.content : ''
    const response = !isUser ? node.content : ''
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
