import type { User } from '.'

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

export type ApplicationType = 'REQUEST' | 'INVITATION'

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACCEPTED' | 'DECLINED' | 'CANCELED'

export interface TeamMemberRealNameStatus {
  memberId: number
  hasRealNameInfo: boolean
  userName: string
}

export interface TeamSummary {
  id: number
  name: string
  intro: string
  avatarId: number
  allMembersVerified?: boolean
  memberRealNameStatus?: TeamMemberRealNameStatus[]
  updatedAt: number
  createdAt: number
}

export interface TeamMembershipApplication {
  id: number
  user: User
  team: TeamSummary
  initiator: User
  type: ApplicationType
  status: ApplicationStatus
  role: TeamMemberRoleType
  message: string | null
  processedBy?: User
  processedAt?: number
  createdAt: number
  updatedAt: number
}

export interface TeamJoinRequestCreate {
  message?: string
}

export interface TeamInvitationCreate {
  userId: number
  role?: TeamMemberRoleType
  message?: string
}
