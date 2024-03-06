import ApiInstance from '../index'
import { CommentableType, NewAttitudeType } from '@/constants'
import { GetCommentsResponse, CreateCommentResponse, GetCommentDetailResponse } from './types'

export namespace CommentsApi {
  export const getComments = (commentableType: CommentableType, commentableId: number) =>
    ApiInstance.request<GetCommentsResponse>({
      url: `/comments/${commentableType}/${commentableId}`,
      method: 'get',
    })

  export const createComment = (commentableType: CommentableType, commentableId: number, content: string) =>
    ApiInstance.request<CreateCommentResponse>({
      url: `/comments/${commentableType}/${commentableId}`,
      method: 'post',
      data: { content },
    })

  export const getCommentDetail = (commentId: number) =>
    ApiInstance.request<GetCommentDetailResponse>({
      url: `/comments/${commentId}`,
      method: 'get',
    })

  export const deleteComment = (commentId: number) =>
    ApiInstance.request({
      url: `/comments/${commentId}`,
      method: 'delete',
    })

  export const attitudeComment = (commentId: number, attitude: NewAttitudeType) =>
    ApiInstance.request({
      url: `/comments/${commentId}/attitudes`,
      method: 'post',
      data: { attitude_type: attitude },
    })
}
