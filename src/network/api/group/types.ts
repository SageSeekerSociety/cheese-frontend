import { Group, Page, Question, Target, User } from '@/types'

export type GetGroupListRes = {
  groups: Group[]
  page: Page
}

export type GetGroupQuestionListRes = {
  questions: Question[]
  page: Page
}

export type GetGroupTargetListRes = {
  targets: Target[]
  page: Page
}

export type GetGroupMemberListRes = {
  users: User[]
  page: Page
}
