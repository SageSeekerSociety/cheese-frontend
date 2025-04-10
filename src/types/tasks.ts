import type { Material, Space, SpaceCategory, Team, TeamSummary, Topic, User } from '.'

export type TaskSubmitterType = 'USER' | 'TEAM'
export type TaskSubmissionEntryType = 'TEXT' | 'FILE'
export type TaskTeamMembershipLockPolicy = 'NO_LOCK' | 'LOCK_ON_APPROVAL'
export type EligibilityRejectReasonCode =
  | 'ALREADY_PARTICIPATING'
  | 'PARTICIPANT_LIMIT_REACHED'
  | 'TASK_NOT_APPROVED'
  | 'DEADLINE_PASSED'
  | 'USER_NOT_FOUND'
  | 'USER_ACCOUNT_ISSUE'
  | 'USER_MISSING_REAL_NAME'
  | 'USER_RANK_NOT_HIGH_ENOUGH'
  | 'TEAM_NOT_FOUND'
  | 'TEAM_SIZE_MIN_NOT_MET'
  | 'TEAM_SIZE_MAX_EXCEEDED'
  | 'TEAM_MISSING_REQUIRED_INFO'
  | 'TEAM_MEMBER_MISSING_REAL_NAME'
  | 'TEAM_MEMBERS_NOT_VERIFIED'
  | 'TEAM_MEMBER_RANK_NOT_HIGH_ENOUGH'
  | 'INDIVIDUAL_PARTICIPATION_NOT_ALLOWED'
  | 'TEAM_PARTICIPATION_NOT_ALLOWED'
  | 'UNKNOWN'

export interface EligibilityRejectReasonInfo {
  code: EligibilityRejectReasonCode
  message: string
  details?: Record<string, any>
}

export interface EligibilityStatus {
  eligible: boolean
  reasons?: EligibilityRejectReasonInfo[]
}

export interface TeamTaskEligibility {
  team: TeamSummary
  eligibility: EligibilityStatus
}

export interface ParticipationEligibility {
  user?: EligibilityStatus
  teams?: TeamTaskEligibility[]
}

export interface TaskSubmissionSchemaEntry {
  prompt: string
  type: TaskSubmissionEntryType
}

export interface Task {
  id: number
  name: string
  intro: string
  submitterType: TaskSubmitterType
  creator: User
  deadline: number
  participantLimit: number
  defaultDeadline: number
  resubmittable: boolean
  editable: boolean
  description: string
  space?: Space
  category?: SpaceCategory
  submissionSchema: TaskSubmissionSchemaEntry[]
  submitters: {
    total: number
    examples: { avatarId: number }[]
  }
  submittable: boolean
  submittableAsTeam?: Team[]
  createdAt: number
  updatedAt: number
  rank: number
  approved: 'APPROVED' | 'DISAPPROVED' | 'NONE'
  rejectReason?: string
  requireRealName: boolean
  minTeamSize?: number
  maxTeamSize?: number
  teamLockingPolicy?: TaskTeamMembershipLockPolicy
  joined?: boolean
  joinedTeams?: Team[]
  topics?: Topic[]
  userDeadline?: number
  participationEligibility?: ParticipationEligibility
}

export interface TaskSubmissionReview {
  reviewed: boolean
  detail: {
    accepted: boolean
    score: number
    comment: string
  }
}

export interface TaskSubmission {
  id: number
  member: TaskParticipantSummary
  submitter: User
  version: number
  index: number
  createdAt: number
  updatedAt: number
  content: TaskSubmissionContent[]
  review?: TaskSubmissionReview
}

export interface TaskSubmissionContent {
  title: string
  type: TaskSubmissionEntryType
  contentText?: string
  contentAttachment?: Material
}

export interface TaskParticipantSummary {
  id: number
  intro: string
  name: string
  avatarId: number
}

export interface TaskParticipantRealNameInfo {
  realName: string
  studentId: string
  grade: string
  major?: string
  className: string
}

export interface TaskTeamParticipantMemberSummary {
  name: string
  intro: string
  avatarId: number
  isLeader: boolean
  realNameInfo?: TaskParticipantRealNameInfo
}

export interface TaskMembership {
  id: number
  member: TaskParticipantSummary
  createdAt: number
  updatedAt: number
  deadline: number | null
  approved: 'APPROVED' | 'DISAPPROVED' | 'NONE'
  realNameInfo?: TaskParticipantRealNameInfo
  email?: string
  phone?: string
  applyReason?: string
  personalAdvantage?: string
  remark?: string
  teamMembers?: TaskTeamParticipantMemberSummary[]
}

export type TaskFormSubmitData = {
  name: string
  submitterType: TaskSubmitterType
  rank: number
  deadline: number | null
  defaultDeadline: number
  resubmittable: boolean
  editable: boolean
  intro: string
  description: string
  categoryId: number
  requireRealName: boolean
  minTeamSize: number
  maxTeamSize: number
  participantLimit?: number
  teamLockingPolicy?: TaskTeamMembershipLockPolicy
}
