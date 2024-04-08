import { Answer, Page, Question, User } from '@/types'

export type GetAnswerListResponse = {
  answers: Answer[]
  page: Page
}

export type GetQuestionListResponse = {
  questions: Question[]
  page: Page
}

export type UserList = {
  users: User[]
  page: Page
}

export type GetUserInfoResponse = {
  user: User
}

export type FollowUserResponse = {
  follow_count: number
}

export type UpdateUserInfoResponse = {
  code: number
  message: string
}
