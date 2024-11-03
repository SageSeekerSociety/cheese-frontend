import type { Material, Team, User } from '.'

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
  resubmittable: boolean
  editable: boolean
  description: string
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
  approved: 'APPROVED' | 'DISAPPROVED' | 'NONE'
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
