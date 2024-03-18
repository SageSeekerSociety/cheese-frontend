import { CommentTag, CommentableType } from '@/constants'
import { User, AttitudeStats } from '.'

export type Comment = {
  id: number
  commentable_type: CommentableType
  commentable_id: number
  content: string
  user: User
  created_at: number
  attitudes: AttitudeStats
  tag?: CommentTag
  sub_comments?: Comment[]
}
