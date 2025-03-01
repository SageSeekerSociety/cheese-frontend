import type { Material, Space, Team, Topic, User } from '.'

export type TaskSubmitterType = 'USER' | 'TEAM'
export type TaskSubmissionEntryType = 'TEXT' | 'FILE'

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
  defaultDeadline: number
  resubmittable: boolean
  editable: boolean
  description: string
  space?: Space
  submissionSchema: TaskSubmissionSchemaEntry[]
  submitters: {
    total: number
    examples: { avatarId: number }[]
  }
  joinable: boolean
  joinableAsTeam?: Team[]
  submittable: boolean
  submittableAsTeam?: Team[]
  createdAt: number
  updatedAt: number
  rank: number
  approved: 'APPROVED' | 'DISAPPROVED' | 'NONE'
  rejectReason?: string
  joined?: boolean
  joinedAsTeam?: Team[]
  joinedApproved?: boolean
  joinedApprovedAsTeam?: Team[]
  joinedDisapproved?: boolean
  joinedDisapprovedAsTeam?: Team[]
  joinedNotApprovedOrDisapproved?: boolean
  joinedNotApprovedOrDisapprovedAsTeam?: Team[]
  topics?: Topic[]
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
  email?: string
  phone?: string
  applyReason?: string
  personalAdvantage?: string
  remark?: string
}

export interface TaskMembership {
  id: number
  member: TaskParticipantSummary
  createdAt: number
  updatedAt: number
  deadline: number | null
  approved: 'APPROVED' | 'DISAPPROVED' | 'NONE'
  realNameInfo?: TaskParticipantRealNameInfo
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
}
