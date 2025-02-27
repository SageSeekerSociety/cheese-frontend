import type { NewAttitudeType } from '@/constants'
import type {
  AskQuestionResponse,
  AttitudeQuestionResponse,
  FollowQuestionResponse,
  GetInvitationsResponse,
  QuestionDetailResponse,
  QuestionInvitationRecommendResponse,
  QuestionInviteUserResponse,
  QuestionList,
} from './types'

import ApiInstance from '../index'

export namespace QuestionApi {
  export type AskQuestionRequest = {
    title: string
    content: string
    type: number
    topics: number[]
    group_id?: number
    bounty: number
  }

  export const search = (query: string, pageStart?: number, pageSize: number = 20) =>
    ApiInstance.request<QuestionList>({
      url: '/questions',
      method: 'GET',
      params: { q: query, page_start: pageStart, page_size: pageSize },
    })

  export const ask = (data: AskQuestionRequest) =>
    ApiInstance.request<AskQuestionResponse>({
      url: '/questions',
      method: 'POST',
      data,
    })

  export const detail = (id: number) =>
    ApiInstance.request<QuestionDetailResponse>({
      url: `/questions/${id}`,
      method: 'GET',
    })

  export const attitudeQuestion = (id: number, attitudeType: NewAttitudeType) =>
    ApiInstance.request<AttitudeQuestionResponse>({
      url: `/questions/${id}/attitudes`,
      method: 'POST',
      data: { attitude_type: attitudeType },
    })

  export const invitationRecommend = (id: number) =>
    ApiInstance.request<QuestionInvitationRecommendResponse>({
      url: `/questions/${id}/invitations/recommendations`,
      method: 'GET',
    })

  export const followQuestion = (id: number) =>
    ApiInstance.request<FollowQuestionResponse>({
      url: `/questions/${id}/followers`,
      method: 'POST',
    })

  export const unfollowQuestion = (id: number) =>
    ApiInstance.request<FollowQuestionResponse>({
      url: `/questions/${id}/followers`,
      method: 'DELETE',
    })

  export const inviteUser = (questionId: number, userId: number) =>
    ApiInstance.request<QuestionInviteUserResponse>({
      url: `/questions/${questionId}/invitations`,
      method: 'POST',
      data: { user_id: userId },
    })

  export const cancelInviteUser = (questionId: number, invitationId: number) =>
    ApiInstance.request({
      url: `/questions/${questionId}/invitations/${invitationId}`,
      method: 'DELETE',
    })

  export const getInvitaions = (questionId: number, pageStart?: number, pageSize: number = 20) =>
    ApiInstance.request<GetInvitationsResponse>({
      url: `/questions/${questionId}/invitations`,
      method: 'GET',
      params: { page_start: pageStart, page_size: pageSize },
    })

  export const addBounty = (questionId: number, bounty: number) =>
    ApiInstance.request({
      url: `/questions/${questionId}/bounty`,
      method: 'PUT',
      data: { bounty },
    })

  export const acceptAnswer = (questionId: number, answerId: number) =>
    ApiInstance.request({
      url: `/questions/${questionId}/acceptance?answer_id=${answerId}`,
      method: 'PUT',
    })
}
