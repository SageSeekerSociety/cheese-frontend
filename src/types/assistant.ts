export type MessagePart =
  | { kind: 'thinking'; text: string; collapsed?: boolean; ts: number }
  | { kind: 'text'; text: string; ts: number }
  | {
      kind: 'tool'
      id: string
      name: string
      input?: Record<string, any>
      result?: unknown
      status: 'calling' | 'success' | 'error'
      phase: 'preface' | 'inline'
      callId?: string
      ts: number
    }
  | { kind: 'divider'; label?: string; ts: number }
  | { kind: 'error'; text: string; ts: number }

export type AssistantRole = 'assistant' | 'user'

export interface AssistantMessage {
  id: string
  role: AssistantRole
  messageType: 'TEXT'
  content?: string
  parts?: MessagePart[]
  timestamp: Date
  isTyping?: boolean
  meta?: {
    toolCount?: number
    hasThinking?: boolean
  }
}

export interface AssistantStreamEvent {
  type: 'start' | 'delta' | 'tool_call' | 'tool_result' | 'complete' | 'error' | 'thinking'
  messageId?: string
  parentMessageId?: string | null
  content?: string
  toolName?: string
  toolInput?: Record<string, any>
  toolResult?: unknown
  toolCallId?: string
  thinkingText?: string
  collapsed?: boolean
}

export interface StreamMessageOptions {
  message: string
  parentMessageId: string | null
  signal?: AbortSignal
}
