import type { Page, Space } from '@/types'

export type PostSpaceRequestData = {
  name: string
  intro?: string
  avatarId?: number
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
  defaultCategoryId?: number
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

export type PostSpaceCategoryRequestData = {
  name: string
  description?: string | null
  displayOrder?: number
}

export type PatchSpaceCategoryRequestData = Partial<PostSpaceCategoryRequestData>
