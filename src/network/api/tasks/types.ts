import { TaskSubmissionSchemaEntry } from '@/types'

export type PostTaskRequestData = {
  name: string
  submitterType: 'USER' | 'TEAM'
  deadline: number
  resubmittable: boolean
  editable: boolean
  description: string
  submissionSchema: TaskSubmissionSchemaEntry[]
  team?: number
  space?: number
}

export type PatchTaskRequestData = {
  name?: string
  deadline?: string
  resubmittable?: boolean
  editable?: boolean
  description?: string
  submissionSchema?: TaskSubmissionSchemaEntry[]
}

export type PostTaskSubmissionRequestData = {
  contentText?: string
  contentAttachmentId?: number
}
