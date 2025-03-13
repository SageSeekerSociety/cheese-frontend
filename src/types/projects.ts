import type { Team, User } from '.'

export type ProjectMemberRole = 'LEADER' | 'MEMBER' | 'EXTERNAL'

export interface ProjectMember {
  id: number
  user: User
  role: ProjectMemberRole
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: number
  name: string
  description: string
  colorCode: string
  startDate: number
  endDate: number
  team: Team
  parentId?: number
  leader: User
  externalTaskId?: number
  githubRepo?: string
  content: string
  members: {
    count: number
    examples: ProjectMember[]
  }
  createdAt: number
  updatedAt: number
}
