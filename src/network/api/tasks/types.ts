import type { Task, TaskSubmissionSchemaEntry, TaskSubmitterType, TaskTeamMembershipLockPolicy } from '@/types'

import { ChatContext } from '@/components/chat'

// 添加参与者身份类型
export interface TaskParticipationIdentity {
  id: number
  type: TaskSubmitterType
  memberId: number
  teamName?: string
  canSubmit: boolean
  approved: 'NONE' | 'APPROVED' | 'DISAPPROVED'
}

// 添加参与信息类型
export interface TaskParticipationInfo {
  hasParticipation: boolean
  identities: TaskParticipationIdentity[]
}

export type PostTaskRequestData = {
  name: string
  submitterType: 'USER' | 'TEAM'
  deadline: number | null
  defaultDeadline: number
  resubmittable: boolean
  editable: boolean
  description: string
  submissionSchema: TaskSubmissionSchemaEntry[]
  team?: number
  space?: number
  categoryId?: number
  requireRealName?: boolean
  minTeamSize?: number
  maxTeamSize?: number
  participantLimit?: number
  teamLockingPolicy?: TaskTeamMembershipLockPolicy
  videoUrl?: string
}

/**
 * PDF 转赛题请求数据
 * @property spaceId - 目标空间 ID
 * @property file - 要上传的 PDF 文件
 * @property categoryId - 可选的分类 ID
 * @property templateIndex - 模板索引，-1 表示使用空白模板
 * @property submitterType - 提交者类型（USER / TEAM）
 * @property maxTasks - 最大解析赛题数量
 */
export type CreateTaskFromPdfRequestData = {
  spaceId: number
  file: File
  categoryId?: number
  templateIndex?: number
  submitterType?: TaskSubmitterType
  maxTasks?: number
}

/** PDF 直接创建赛题的响应数据 */
export type CreateTaskFromPdfResponseData = {
  task: Task
}

/**
 * PDF 解析预览的响应数据
 * @property drafts - 解析出的赛题草稿列表
 * @property templateUsed - 实际使用的模板信息
 * @property tokenUsed - 本次解析消耗的 token 数量
 */
export type PreviewTaskFromPdfResponseData = {
  drafts: PostTaskRequestData[]
  templateUsed: Record<string, any>
  tokenUsed: number
}

/** 确认发布 PDF 解析草稿的请求数据 */
export type ConfirmTaskFromPdfRequestData = {
  drafts: PostTaskRequestData[]
}

/**
 * 确认发布 PDF 解析草稿的响应数据
 * @property tasks - 已创建的赛题列表
 * @property count - 成功创建的赛题数量
 */
export type ConfirmTaskFromPdfResponseData = {
  tasks: Task[]
  count: number
}

export type PatchTaskRequestData = {
  name?: string
  deadline?: number | null
  defaultDeadline?: number
  resubmittable?: boolean
  editable?: boolean
  description?: string
  submissionSchema?: TaskSubmissionSchemaEntry[]
  approved?: 'APPROVED' | 'DISAPPROVED' | 'NONE'
  rejectReason?: string
  requireRealName?: boolean
  participantLimit?: number
  teamLockingPolicy?: TaskTeamMembershipLockPolicy
  videoUrl?: string
}

export type AddTaskParticipantRequestData = {
  deadline: number | null
  email?: string
  phone?: string
  applyReason?: string
  personalAdvantage?: string
  remark?: string
}

export type PatchTaskParticipantRequestData = {
  deadline?: number
  approved?: 'APPROVED' | 'DISAPPROVED' | 'NONE'
  rejectReason?: string
  email?: string
  phone?: string
  applyReason?: string
  personalAdvantage?: string
  remark?: string
}

export type PostTaskSubmissionRequestData = {
  text?: string
  attachmentId?: number
}

export type PostTaskSubmissionReviewRequestData = {
  accepted: boolean
  score: number
  comment: string
}

export type PatchTaskSubmissionReviewRequestData = Partial<PostTaskSubmissionReviewRequestData>

export type TaskAIAdvice = {
  topic_summary: {
    title: string
    key_points: string[]
  }
  knowledge_fields: {
    name: string
    description: string
    followup_questions: string[]
  }[]
  learning_paths: {
    stage: string
    description: string
    resources: {
      name: string
      type: string
      url: string
    }[]
    followup_questions: string[]
  }[]
  methodology: {
    step: string
    description: string
    estimated_time: string
    followup_questions: string[]
  }[]
  team_tips: {
    role: string
    description: string
    collaboration_tips: string
    followup_questions: string[]
  }[]
}

export type TaskAIAdviceConversationContext = ChatContext & {
  section: 'knowledge_fields' | 'learning_paths' | 'methodology' | 'team_tips'
  index: number
  displayName?: string | null
}

export interface ChatReference {
  url: string
  logo_url: string
  title: string
  summary: string
}

export interface TaskAIAdviceConversation {
  id: number
  taskId: number
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

export interface ConversationGroupSummary {
  conversationId: string
  title?: string
  createdAt: string
  updatedAt: string
  messageCount: number
  latestMessage?: TaskAIAdviceConversation
}

export interface QuotaInfo {
  daily: {
    used: number
    limit: number
  }
  monthly: {
    used: number
    limit: number
  }
}

export interface TaskAIAdviceConversationResponse {
  conversation: TaskAIAdviceConversation
  quota: QuotaInfo
}

export interface CreateTaskAIAdviceConversationRequest {
  question: string
  context?: TaskAIAdviceConversationContext
  conversationId?: string
  parentId?: number
}

export enum ReasoningStatus {
  NONE = 'none',
  REASONING = 'reasoning',
  COMPLETED = 'completed',
}
