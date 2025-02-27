export interface ChatReference {
  url: string
  logo_url: string
  title: string
  summary: string
}

// 定义聊天消息的类型
export interface ChatMessage {
  id: number
  question: string
  response: string
  modelType: 'standard' | 'reasoning'
  reasoningContent?: string
  reasoningTimeMs?: number
  followupQuestions: string[]
  conversationId?: string
  parentId?: number
  createdAt: string
  references?: ChatReference[]
  tokensUsed?: string
  seuConsumed?: string
}

// 对话树节点类型
export interface ChatMessageNode extends ChatMessage {
  children: ChatMessageNode[]
}

// 对话分支信息
export interface ConversationBranch {
  pathIds: number[]
  messages: ChatMessage[]
  branchPoints: number[] // 有多个子节点的消息ID
}

// 对话组的摘要信息
export interface ConversationSummary {
  conversationId: string
  title?: string
  createdAt: string
  updatedAt: string
  messageCount: number
  latestMessage?: ChatMessage | null
}

// 上下文类型定义
export interface ChatContext {
  [key: string]: any
}

// 推理状态枚举
export enum ReasoningStatus {
  NONE = 'none',
  REASONING = 'reasoning',
  COMPLETED = 'completed',
}

// 聊天API服务的选项类型
export interface ChatStreamOptions<T extends ChatContext = ChatContext> {
  // 请求信息
  contextId: number | string // 上下文ID（如任务ID）
  question: string
  modelType: 'standard' | 'reasoning'
  context?: T
  conversationId?: string
  parentId?: number

  // 回调函数
  callbacks: {
    onPartialResponse?: (message: string) => void
    onCompleteResponse?: (message: string) => void
    onFollowupQuestions?: (questions: string[]) => void
    onConversationId?: (id: string) => void
    onMessageId?: (id: number) => void
    onError?: (err: any) => void
    onClose?: () => void
    onReasoningStart?: () => void
    onReasoningPartial?: (message: string) => void
    onReasoningComplete?: (fullReasoning: string) => void
    onReasoningTime?: (timeMs: number) => void
    onTitle?: (title: string) => void
    onReferences?: (references: ChatReference[]) => void
    onTokensUsed?: (tokensUsed: string) => void
    onSeuConsumed?: (seuConsumed: string) => void
  }
}

// 聊天服务接口
export interface ChatService<T extends ChatContext = ChatContext> {
  streamConversation: (options: ChatStreamOptions<T>) => { close: () => void }
  getConversations: (contextId: number | string) => Promise<ConversationSummary[]>
  getConversationById: (contextId: number | string, conversationId: string) => Promise<ChatMessage[]>
  deleteConversation: (contextId: number | string, conversationId: string) => Promise<void>

  // 新增：获取上下文标签
  getContextChips?: (context?: T) => ContextChip[]
}

// 上下文标签接口
export interface ContextChip {
  label: string
  icon?: string
  color?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
}
