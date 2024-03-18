import ApiInstance from '../index'
import {
  AttitudeQuestionResponse,
  FollowQuestionResponse,
  AskQuestionResponse,
  QuestionDetailResponse,
  QuestionInvitationRecommendResponse,
  QuestionInviteUserResponse,
  GetInvitationsResponse,
} from './types'
import { NewAttitudeType } from '@/constants'

export namespace QuestionApi {
  export type AskQuestionRequest = {
    title: string
    content: string
    type: number
    topics: number[]
    group_id?: number
  }

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
}
