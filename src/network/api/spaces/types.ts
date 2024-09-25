import { Space, Page } from '@/types'

export type PostSpaceRequestData = {
  name: string
  intro: string
  avatarId: number
}

export type PatchSpaceRequestData = {
  name?: string
  intro?: string
  avatarId?: number
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
