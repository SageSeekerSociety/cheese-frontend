import { User } from './users'

export type Topic = {
  id: number
  name: string
  // parent_id: number
  // children: Topic[]
}

export type Group = {
  id: number
  name: string
  intro: string
  owner: User
  created_at: number
  updated_at: number
  member_count: number
  question_count: number
  answer_count: number
  is_member: boolean
  is_owner: boolean
  is_public: boolean
}

export type Question = {
  id: number
  title: string
  content: string
  user: User
  type: number
  topics: Topic[]
  created_at: number
  updated_at: number
  is_follow: boolean
  is_like: boolean
  answer_count: number
  comment_count: number
  follow_count: number
  like_count: number
  view_count: number
  is_group: boolean
  group?: Group
}
