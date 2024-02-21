import { User } from './users'
export type Group = {
  id: number
  name: string
  intro: string
  owner: User
  created_at: number
  member_count: number
  question_count: number
  answer_count: number
  is_member: boolean
  is_owner: boolean
  is_public: boolean
}
