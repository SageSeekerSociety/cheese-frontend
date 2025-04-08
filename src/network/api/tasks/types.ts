import type { TaskSubmissionSchemaEntry, TaskSubmitterType } from '@/types'

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

// 队伍成员实名状态
export interface TeamMemberRealNameStatus {
  memberId: number
  hasRealNameInfo: boolean
  userName: string
}

// 队伍摘要信息
export interface TeamSummary {
  id: number
  name: string
  intro: string
  avatarId: number
  allMembersVerified: boolean
  memberRealNameStatus?: TeamMemberRealNameStatus[]
  joinRejectReason?: string
  updatedAt: number
  createdAt: number
}
