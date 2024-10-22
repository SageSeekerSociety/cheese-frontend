import type { User } from '.'

export type Space = {
  id: number
  intro: string
  name: string
  avatarId: number
  admins: SpaceAdmin[]
  announcements: string
  taskTemplates: string
}

export type SpaceAnnouncement = {
  title: string
  content: string
  createdAt: number
  updatedAt: number
  publisher: string
}

export type SpaceTaskTemplate = {
  name: string
  description: string
  title: string
  content: string
}

export type SpaceAdmin = {
  role: SpaceAdminRoleType
  user: User
}

export type SpaceAdminRoleType = 'OWNER' | 'ADMIN'
