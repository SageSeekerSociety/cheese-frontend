import { Answer } from '@/types/answer'
import { Page } from '@/types/page'
import { Question } from '@/types/question'
import { User } from '@/types/users'

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
