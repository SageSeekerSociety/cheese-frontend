import { User } from '.'

export type TeamMemberRoleType = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface TeamMember {
  role: TeamMemberRoleType
  user: User
}

export interface Team {
  id: number
  intro: string
  name: string
  avatarId: number
  owner: User
  admins: {
    total: number
    examples: User[]
  }
  members: {
    total: number
    examples: User[]
  }
}
