import type { User } from '.'

export type DiscussableModelType = 'PROJECT'

export interface ReactionType {
  id: number
  code: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
}

export interface DiscussionReaction {
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
  reactions?: DiscussionReaction[]
  subDiscussions?: {
    count: number
    examples: Discussion[]
  }
  createdAt: number
}

// 以下是扩展接口，用于前端显示，但不是API返回的内容
export interface DiscussionWithReplies extends Discussion {
  replies?: Discussion[]
}

export interface DiscussionAttachment {
  id: number
  name: string
  size: number
  type: string
  url: string
}

// 用于UI显示的扩展Discussion类型
export interface DiscussionWithUI extends Discussion {
  attachments?: DiscussionAttachment[]
  links?: {
    url: string
    title: string
    description: string
    image?: string
  }[]
  replyTo?: {
    id: number
    nickname: string
  }
}
