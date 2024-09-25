export type User = {
  id: number
  username: string
  nickname: string
  avatar: string
  avatarId: number
  intro: string
  follow_count: number
  fans_count: number
  question_count: number
  answer_count: number
  is_follow?: boolean
}
