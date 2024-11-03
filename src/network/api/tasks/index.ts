// src/api/tasks.ts

import type { Page, TaskParticipantSummary, TaskSubmission } from '@/types'
import type { Task } from '@/types'
import type {
  PatchTaskParticipantRequestData,
  PatchTaskRequestData,
  PatchTaskSubmissionReviewRequestData,
  PostTaskRequestData,
  PostTaskSubmissionRequestData,
  PostTaskSubmissionReviewRequestData,
} from './types'

import { NewApiInstance } from '../index'

export namespace TasksApi {
  export const create = (data: PostTaskRequestData) =>
    NewApiInstance.request<{ task: Task }>({
      url: '/tasks',
      method: 'POST',
      data,
    })

  export const update = (taskId: number, data: PatchTaskRequestData) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}`,
      method: 'PATCH',
      data,
    })

  export const del = (taskId: number) =>
    NewApiInstance.request({
      url: `/tasks/${taskId}`,
      method: 'DELETE',
    })

  export const detail = (taskId: number, queryJoinability: boolean = true, querySubmittability: boolean = true) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}`,
      method: 'GET',
      params: { queryJoinability, querySubmittability },
    })

  export const list = (params: {
    space?: number
    team?: number
    owner?: number
    page_size?: number
    page_start?: number
    sort_by: 'createdAt' | 'updatedAt' | 'deadline'
    sort_order: 'asc' | 'desc'
    queryJoinability?: boolean
    querySubmittability?: boolean
    keywords?: string
    approved?: 'APPROVED' | 'DISAPPROVED' | 'NONE'
  }) =>
    NewApiInstance.request<{ tasks: Task[]; page: Page }>({
      url: '/tasks',
      method: 'GET',
      params,
    })

  export const addParticipant = (taskId: number, member: number, deadline: number | null = null) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants`,
      method: 'POST',
      params: { member },
      data: { deadline },
    })

  export const removeParticipant = (taskId: number, member: number) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants`,
      method: 'DELETE',
      params: { member },
    })

  export const getParticipants = (taskId: number) =>
    NewApiInstance.request<{ participants: TaskParticipantSummary[] }>({
      url: `/tasks/${taskId}/participants`,
      method: 'GET',
    })

  export const updateParticipant = (taskId: number, member: number, data: PatchTaskParticipantRequestData) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants`,
      method: 'PATCH',
      params: { member },
      data,
    })

  export const createSubmission = (taskId: number, member: number, data: PostTaskSubmissionRequestData[]) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/${taskId}/submissions`,
      method: 'POST',
      params: { member },
      data,
    })

  export const updateSubmission = (
    taskId: number,
    member: number,
    version: number,
    data: PostTaskSubmissionRequestData[]
  ) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/${taskId}/submissions/${version}`,
      method: 'PATCH',
      params: { member },
      data,
    })

  export const listSubmissions = (
    taskId: number,
    params: {
      member?: number
      allVersions?: boolean
      page_size?: number
      page_start?: number
      sort_by: 'createdAt' | 'updatedAt'
      sort_order: 'asc' | 'desc'
      queryReview?: boolean
    }
  ) =>
    NewApiInstance.request<{ submissions: TaskSubmission[]; page: Page }>({
      url: `/tasks/${taskId}/submissions`,
      method: 'GET',
      params,
    })

  export const postSubmissionReview = (submissionId: number, data: PostTaskSubmissionReviewRequestData) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      // the fucking backend designed the endpoint like this
      url: `/tasks/submissions/${submissionId}/review`,
      method: 'POST',
      data,
    })

  export const patchSubmissionReview = (submissionId: number, data: PatchTaskSubmissionReviewRequestData) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/submissions/${submissionId}/review`,
      method: 'PATCH',
      data,
    })

  export const deleteSubmissionReview = (submissionId: number) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/submissions/${submissionId}/review`,
      method: 'DELETE',
    })
}
