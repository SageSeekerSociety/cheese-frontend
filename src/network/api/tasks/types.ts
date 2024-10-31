import type { TaskSubmissionSchemaEntry } from '@/types'

export type PostTaskRequestData = {
  name: string
  submitterType: 'USER' | 'TEAM'
  deadline: number | null
  defaultDeadline: number
  resubmittable: boolean
  editable: boolean
  description: string
  submissionSchema: TaskSubmissionSchemaEntry[]
  team?: number
  space?: number
}

export type PatchTaskRequestData = {
  name?: string
  deadline?: number | null
  defaultDeadline?: number
  resubmittable?: boolean
  editable?: boolean
  description?: string
  submissionSchema?: TaskSubmissionSchemaEntry[]
  approved?: boolean
  rejectReason?: string
}

export type PatchTaskParticipantRequestData = {
  deadline?: number
  approved?: boolean
}

export type PostTaskSubmissionRequestData = {
  contentText?: string
  contentAttachmentId?: number
}

export type PostTaskSubmissionReviewRequestData = {
  accepted: boolean
  score: number
  comment: string
}

export type PatchTaskSubmissionReviewRequestData = Partial<PostTaskSubmissionReviewRequestData>
