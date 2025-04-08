import type { DiscussableModelType, User } from '@/types'

export interface ReactionType {
  id: number
  code: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
}

export interface DiscussionReactionSummary {
  reactionType: ReactionType
  count: number
  hasReacted: boolean
}

export interface Discussion {
  id: number
  modelType: DiscussableModelType
  modelId: number
  content: string
  parentId?: number
  sender: User
  mentionedUsers?: User[]
  reactions?: DiscussionReactionSummary[]
  createdAt: number
}

export type CreateDiscussionRequest = {
  content: string
  modelType: DiscussableModelType
  modelId: number
  parentId?: number
  mentionedUserIds?: number[]
}

export type ListDiscussionsParams = {
  modelType: DiscussableModelType
  modelId: number
  parent_id?: number
  pageStart?: number
  pageSize?: number
  sort_by?: 'createdAt' | 'updatedAt'
  sort_order?: 'asc' | 'desc'
}

export type ReactToDiscussionRequest = {
  emoji: string
}

export type UpdateDiscussionRequest = {
  content?: string
}
