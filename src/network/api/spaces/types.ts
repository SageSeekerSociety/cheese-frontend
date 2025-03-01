import type { Page, Space } from '@/types'

export type PostSpaceRequestData = {
  name: string
  intro: string
  avatarId: number
  announcements?: string
  taskTemplates?: string
}

export type PatchSpaceRequestData = {
  name?: string
  intro?: string
  avatarId?: number
  announcements?: string
  taskTemplates?: string
  classificationTopics?: number[]
}

export type PostSpaceAdminRequestData = {
  userId: number
  role: 'OWNER' | 'ADMIN'
}

export type PatchSpaceAdminRequestData = {
  role: 'OWNER' | 'ADMIN'
}

export type GetSpacesResponseData = {
  spaces: Space[]
  page: Page
}
