import type { AttitudeStats, Group, User } from '.'

export type Answer = {
  id: number
  question_id: number
  content: string
  author: User
  created_at: number
  updated_at: number
  attitudes: AttitudeStats
  is_favorite: boolean
  comment_count: number
  favorite_count: number
  view_count: number
  is_group: boolean
  group: Group
}
