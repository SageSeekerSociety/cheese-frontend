import type { Page, Project, ProjectMember } from '@/types'

import { NewApiInstance } from '../index'

export namespace ProjectsApi {
  export type CreateProjectRequestData = {
    name: string
    description: string
    colorCode: string
    startDate: number
    endDate: number
    teamId: number
    leaderId: number
    parentId?: number
    externalTaskId?: number
    githubRepo?: string
    memberIds?: number[]
    externalCollaboratorIds?: number[]
  }

  export type GetProjectsRequestParams = {
    team_id: number
    parent_id?: number
    leader_id?: number
    member_id?: number
    page_start?: number
    page_size?: number
  }

  export const create = (data: CreateProjectRequestData) =>
    NewApiInstance.request<{ project: Project }>({
      url: '/projects',
      method: 'POST',
      data,
    })

  export const list = (params: GetProjectsRequestParams) =>
    NewApiInstance.request<{ projects: Project[] }>({
      url: '/projects',
      method: 'GET',
      params,
    })

  export const detail = (projectId: number) =>
    NewApiInstance.request<{ project: Project }>({
      url: `/projects/${projectId}`,
      method: 'GET',
    })

  export const update = (projectId: number, data: Partial<CreateProjectRequestData> & { archived?: boolean }) =>
    NewApiInstance.request<{ project: Project }>({
      url: `/projects/${projectId}`,
      method: 'PATCH',
      data,
    })

  export const del = (projectId: number) =>
    NewApiInstance.request({
      url: `/projects/${projectId}`,
      method: 'DELETE',
    })

  export const addMember = (projectId: number, userId: number, role?: string) =>
    NewApiInstance.request<{ project: Project }>({
      url: `/projects/${projectId}/members`,
      method: 'POST',
      data: { userId, role },
    })

  export const removeMember = (projectId: number, userId: number) =>
    NewApiInstance.request({
      url: `/projects/${projectId}/members/${userId}`,
      method: 'DELETE',
    })

  export const getMembers = (projectId: number) =>
    NewApiInstance.request<{ members: ProjectMember[] }>({
      url: `/projects/${projectId}/members`,
      method: 'GET',
    })
}
