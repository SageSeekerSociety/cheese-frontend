import type { Answer, AttitudeStats, Group, Topic, User } from '.'

export type Question = {
  id: number
  title: string
  content: string
  author: User
  type: number
  topics: Topic[]
  created_at: number
  updated_at: number
  attitudes: AttitudeStats
  is_follow: boolean
  is_answered: boolean
  my_answer_id?: number
  answer_count: number
  comment_count: number
  follow_count: number
  view_count: number
  is_group: boolean
  group?: Group
  has_bounty: boolean
  bounty: number
  bounty_start_at: number
  is_solved: boolean
  accepted_answer?: Answer
}

export type QuestionInvitation = {
  id: number
  question_id: number
  user: User
  created_at: number
  updated_at: number
  is_answered: boolean
}
