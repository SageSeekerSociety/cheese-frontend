import { Question } from '@/types'
import ApiInstance from './index'

export namespace QuestionApi {
  export type AskQuestionRequestData = {
    title: string
    content: string
    type: number
    topics: number[]
    group_id?: number
  }

  export type AskQuestionResponseData = {
    id: number
  }

  export const ask = (data: AskQuestionRequestData) =>
    ApiInstance.request<AskQuestionResponseData>({
      url: '/questions',
      method: 'POST',
      data,
    })

  export const detail = (id: number) =>
    ApiInstance.request<Question>({
      url: `/questions/${id}`,
      method: 'GET',
    })
}
