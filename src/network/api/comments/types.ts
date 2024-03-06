import { Comment, Page } from '@/types'

export type GetCommentsResponse = {
  comments: Comment[]
  page: Page
}

export type CreateCommentResponse = {
  id: number
}

export type GetCommentDetailResponse = {
  comment: Comment
}
