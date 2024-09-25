// src/api/tasks.ts

import { Page, TaskParticipantSummary, TaskSubmission } from '@/types'
import { Task } from '@/types'
import { NewApiInstance } from '../index'
import { PostTaskRequestData, PatchTaskRequestData, PostTaskSubmissionRequestData } from './types'

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
    page_size?: number
    page_start?: number
    sort_by: 'createdAt' | 'updatedAt' | 'deadline'
    sort_order: 'asc' | 'desc'
    queryJoinability?: boolean
    querySubmittability?: boolean
  }) =>
    NewApiInstance.request<{ tasks: Task[]; page: Page }>({
      url: '/tasks',
      method: 'GET',
      params,
    })

  export const addParticipant = (taskId: number, member: number) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants`,
      method: 'POST',
      params: { member },
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
    }
  ) =>
    NewApiInstance.request<{ submissions: TaskSubmission[]; page: Page }>({
      url: `/tasks/${taskId}/submissions`,
      method: 'GET',
      params,
    })
}
