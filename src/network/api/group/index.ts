import { GroupList } from '@/types/grouplist'
import ApiInstance from '../index'
import { User } from '@/types/users'
import { QuestionList } from '@/types/questionlist'
import { Group } from '@/types/group'
import exp from 'constants'
import { TargetList } from '@/types/targetlist'
import { UserList } from '@/types/userlist'

export namespace GroupApi {
  export const getAllGroupList = (data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<GroupList>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups`,
      // url: '/groups',
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
    ApiInstance.request<QuestionList>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupid}/questions`,
      // url: '/group',
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
      },
    })

  export type GetGroupInfoResponse = {
    group: Group
  }

  export const getGroupInfo = (groupid: number) =>
    ApiInstance.request<Group>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupid}`,
      method: 'GET',
    })
  export const getGroupTargetList = (groupid: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<TargetList>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupid}/targets`,
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
        type: 'recommend',
      },
    })
  export const getGroupMemberList = (groupid: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<UserList>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups/${groupid}/members`,
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
      },
    })
  //todo : add avatar, cookie, type
  export const postCreateGroupInfo = (data: { name: string; info: string }) =>
    ApiInstance.request<Group>({
      url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/groups`,
      method: 'POST',
      data,
    })
}
