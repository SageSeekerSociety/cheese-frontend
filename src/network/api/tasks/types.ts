import type { TaskSubmissionSchemaEntry } from '@/types'

import { ChatContext } from '@/components/chat'

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
}

export type PatchTaskParticipantRequestData = {
  deadline?: number
  approved?: 'APPROVED' | 'DISAPPROVED' | 'NONE'
}

export type PostTaskSubmissionRequestData = {
  contentText?: string
  contentAttachmentId?: number
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
