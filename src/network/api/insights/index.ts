import { AttitudeInsightResponse, Insight } from '@/types'
import ApiInstance from '../index'
import { NewAttitudeType } from '@/constants'

export namespace InsightsApi {
  // TODO: likes and comments

  export type PostInsightRequestData = {
    content: string
    medias: { type: string; id: string }[]
    attachment: { type: string; id: string }
  }

  export type UpdateInsightRequestData = {
    content: string
  }

  export type PostInsightResponseData = {
    id: number
  }

  export type InsightDetailResponse = {
    insight: Insight
  }

  export const post = (data: PostInsightRequestData) =>
    ApiInstance.request<PostInsightResponseData>({
      url: '/insights',
      method: 'POST',
      data,
    })

  export const update = (id: number, data: UpdateInsightRequestData) =>
    ApiInstance.request({
      url: `/insights/${id}`,
      method: 'PUT',
      data,
    })

  export const del = (id: number) =>
    ApiInstance.request({
      url: `/insights/${id}`,
      method: 'DELETE',
    })

  export const detail = (id: number) =>
    ApiInstance.request<InsightDetailResponse>({
      url: `/insights/${id}`,
      method: 'GET',
    })
  export const postAttitude = (id: number, attitude: NewAttitudeType) =>
    ApiInstance.request<AttitudeInsightResponse>({
      url: `/insights/${id}/attitudes`,
      method: 'POST',
      data: { attitude_type: attitude },
    })
}
