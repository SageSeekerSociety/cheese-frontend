import ApiInstance from '../index'
import { AnswerQuestionResponse, AttitudeAnswerResponse, GetAnswerDetailResponse, GetAnswersResponse } from './types'
import { NewAttitudeType } from '@/constants'

export namespace AnswersApi {
  export const getAnswers = (questionId: number, pageStart?: number, pageSize = 20) =>
    ApiInstance.request<GetAnswersResponse>({
      url: `/questions/${questionId}/answers`,
      method: 'GET',
      params: {
        page_start: pageStart,
        page_size: pageSize,
      },
    })

  export const answerQuestion = (questionId: number, content: string) =>
    ApiInstance.request<AnswerQuestionResponse>({
      url: `/questions/${questionId}/answers`,
      method: 'POST',
      data: {
        content,
      },
    })

  export const getAnswerDetail = (questionId: number, answerId: number) =>
    ApiInstance.request<GetAnswerDetailResponse>({
      url: `/questions/${questionId}/answers/${answerId}`,
    })

  export const postAttitude = (questionId: number, answerId: number, attitude: NewAttitudeType) =>
    ApiInstance.request<AttitudeAnswerResponse>({
      url: `/questions/${questionId}/answers/${answerId}/attitudes`,
      method: 'post',
      data: { attitude_type: attitude },
    })

  export const favorite = (questionId: number, answerId: number) =>
    ApiInstance.request({
      url: `/questions/${questionId}/answers/${answerId}/favorite`,
      method: 'put',
    })

  export const unfavorite = (questionId: number, answerId: number) =>
    ApiInstance.request({
      url: `/questions/${questionId}/answers/${answerId}/favorite`,
      method: 'delete',
    })
}

export * from './types'
