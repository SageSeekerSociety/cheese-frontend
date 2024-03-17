import {
  GetGroupListRes,
  GetGroupMemberListRes,
  GetGroupQuestionListRes,
  GetGroupTargetListRes,
  GetGroupNameAvailablitiesRes,
  GetGroupTargetDetailResponse,
} from './types'
import ApiInstance from '../index'
import { Group, GroupSettings } from '@/types'

export namespace GroupApi {
  export const getAllGroupList = (data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<GetGroupListRes>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups`,
      method: 'GET',
      data: {
        keyWords: '',
        pageStart: data.pageStart,
        pageSize: data.pageSize,
        type: 'recommend',
      },
      headers: {
        Prefer: 'code=200, dynamic=true',
      },
    })

  export const getGroupQuestionList = (groupid: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<GetGroupQuestionListRes>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupid}/questions`,
      // url: '/group',
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
      },
      headers: {
        Prefer: 'code=200, dynamic=true',
      },
    })

  export type GetGroupInfoRes = {
    group: Group
  }

  export const getGroupInfo = (groupid: number) =>
    ApiInstance.request<GetGroupInfoRes>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupid}`,
      method: 'GET',
      headers: {
        Prefer: 'code=200, dynamic=true',
      },
    })
  export const getGroupTargetList = (groupId: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<GetGroupTargetListRes>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupId}/targets`,
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
        type: 'recommend',
      },
      headers: {
        Prefer: 'code=200, dynamic=true',
        Accept: 'application/json',
      },
    })
  export const getGroupMemberList = (groupid: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<GetGroupMemberListRes>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupid}/members`,
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
      },
      headers: {
        Prefer: 'code=200, dynamic=true',
        Authorization: 'Bearer 123',
      },
    })
  //todo : add avatar, cookie, type
  export const postCreateGroupInfo = (data: { name: string; info: string }) =>
    ApiInstance.request<Group>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups`,
      method: 'POST',
      data,
    })

  export const GetGroupNameAvailablities = (data: { name: string }) =>
    ApiInstance.request<GetGroupNameAvailablitiesRes>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/availablities/${data.name}/`,
      method: 'GET',
      data,
    })

  //todo: add cookie
  export const GetGroupSettings = (groupid: number) =>
    ApiInstance.request<GroupSettings>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupid}/settings`,
      method: 'GET',
    })

  export const getGroupTargetDetail = (groupId: number, targetId: number) =>
    ApiInstance.request<GetGroupTargetDetailResponse>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupId}/targets/${targetId}`,
      method: 'GET',
      headers: { Prefer: 'code=200, dynamic=true', Accept: 'application/json' },
    })
}
