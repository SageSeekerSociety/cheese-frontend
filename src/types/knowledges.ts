import type { JSONContent } from 'vuetify-pro-tiptap'
import type { User } from '.'
import type { Material, MaterialType } from './materials'

export type KnowledgeType = 'MATERIAL' | 'LINK' | 'TEXT' | 'CODE'

export interface KnowledgeContentData {
  // MATERIAL 和 TEXT 类型：富文本内容
  richText?: JSONContent
  // LINK 类型：链接内容
  url?: string
  title?: string
  description?: string
  // CODE 类型：代码内容
  code?: string
  language?: string
}

export interface Knowledge {
  id: number
  name: string
  description?: string
  type: KnowledgeType
  content: string
  url?: string
  materialId?: number
  material?: Material
  thumbnail?: string
  teamId: number
  projectId?: number
  discussionId?: number
  labels?: string[]
  creator: User
  sourceChannel?: {
    id: number
    name: string
  }
  originalMessage?: {
    content: string
    sender: User
    createdAt: number
  }
  createdAt: number
  updatedAt: number
}

export interface ListKnowledgesParams {
  teamId: number
  projectId?: number
  type?: KnowledgeType
  materialType?: MaterialType
  labels?: string[]
  query?: string
  page_start?: number
  page_size?: number
  sort_by?: 'createdAt' | 'updatedAt'
  sort_order?: 'asc' | 'desc'
}

export interface CreateKnowledgeRequest {
  name: string
  description?: string
  type: KnowledgeType
  content: string
  teamId: number
  projectId?: number
  discussionId?: number
  labels?: string[]
  materialId?: number
}

export interface UpdateKnowledgeRequest {
  name?: string
  description?: string
  type?: KnowledgeType
  content?: string
  teamId?: number
  projectId?: number
  labels?: string[]
}

export function parseKnowledgeContent(knowledge: Knowledge): KnowledgeContentData {
  try {
    return JSON.parse(knowledge.content)
  } catch (e) {
    console.error('解析Knowledge内容失败:', e)
    return {}
  }
}

export function stringifyKnowledgeContent(content: KnowledgeContentData): string {
  return JSON.stringify(content)
}
