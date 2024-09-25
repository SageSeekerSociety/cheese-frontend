import { NewApiInstance } from '../index'
import { Team, TeamMember, Page } from '@/types'

export namespace TeamsApi {
  export type PostTeamRequestData = {
    name: string
    intro: string
    avatarId: number
  }

  export type PatchTeamRequestData = {
    name?: string
    intro?: string
    avatarId?: number
  }

  export type PostTeamMemberRequestData = {
    userId: number
    role: 'OWNER' | 'ADMIN' | 'MEMBER'
  }

  export type PatchTeamMemberRequestData = {
    role: 'OWNER' | 'ADMIN' | 'MEMBER'
  }

  export type SearchTeamsRequestData = {
    query: string
    page_start?: number
    page_size?: number
  }

  export const search = (params: SearchTeamsRequestData) =>
    NewApiInstance.request<{ teams: Team[]; page: Page }>({
      url: '/teams',
      method: 'GET',
      params,
    })

  export const create = (data: PostTeamRequestData) =>
    NewApiInstance.request<{ team: Team }>({
      url: '/teams',
      method: 'POST',
      data,
    })

  export const update = (teamId: number, data: PatchTeamRequestData) =>
    NewApiInstance.request<{ team: Team }>({
      url: `/teams/${teamId}`,
      method: 'PATCH',
      data,
    })

  export const del = (teamId: number) =>
    NewApiInstance.request({
      url: `/teams/${teamId}`,
      method: 'DELETE',
    })

  export const detail = (teamId: number) =>
    NewApiInstance.request<{ team: Team }>({
      url: `/teams/${teamId}`,
      method: 'GET',
    })

  export const getMyTeams = () =>
    NewApiInstance.request<{ teams: Team[] }>({
      url: '/teams/my-teams',
      method: 'GET',
    })

  export const list = (params: { pageSize?: number; pageStart?: number; sortBy: string; sortOrder: string }) =>
    NewApiInstance.request<{ teams: Team[]; page: Page }>({
      url: '/teams',
      method: 'GET',
      params,
    })

  export const addMember = (teamId: number, data: PostTeamMemberRequestData) =>
    NewApiInstance.request<{ team: Team }>({
      url: `/teams/${teamId}/members`,
      method: 'POST',
      data,
    })

  export const updateMember = (teamId: number, userId: number, data: PatchTeamMemberRequestData) =>
    NewApiInstance.request<{ team: Team }>({
      url: `/teams/${teamId}/members/${userId}`,
      method: 'PATCH',
      data,
    })

  export const removeMember = (teamId: number, userId: number) =>
    NewApiInstance.request({
      url: `/teams/${teamId}/members/${userId}`,
      method: 'DELETE',
    })

  export const getMembers = (teamId: number) =>
    NewApiInstance.request<{ members: TeamMember[] }>({
      url: `/teams/${teamId}/members`,
      method: 'GET',
    })
}
