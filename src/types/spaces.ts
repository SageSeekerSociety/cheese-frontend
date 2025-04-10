import type { Topic, User } from '.'

export type Space = {
  id: number
  intro: string
  name: string
  avatarId: number
  admins: SpaceAdmin[]
  announcements: string
  taskTemplates: string
  classificationTopics: Topic[]
  defaultCategoryId?: number
}

export type SpaceCategory = {
  id: number
  name: string
  description: string | null
  displayOrder: number
  createdAt: number
  updatedAt: number
  archivedAt: number | null
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
  submitterType?: 'USER' | 'TEAM' | null
  rank?: number | null
  minTeamSize?: number
  maxTeamSize?: number
  defaultDeadline?: number | null
  requireRealName?: boolean | null
}

export type SpaceAdmin = {
  role: SpaceAdminRoleType
  user: User
}

export type SpaceAdminRoleType = 'OWNER' | 'ADMIN'
