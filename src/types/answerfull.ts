import { User } from './users'
import { Group } from './group'
export type Answer = {
  id: number
  question_id: number
  content: string
  author: User
  created_at: number
  updated_at: number
  agree_type: number
  is_favorite: boolean
  agree_count: number
  comment_count: number
  favorite_count: number
  view_count: number
  is_group: boolean
  group: Group
}
