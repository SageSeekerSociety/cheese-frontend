import { Group, Page, Question, GroupTarget, User } from '@/types'

export type GetGroupListRes = {
  groups: Group[]
  page: Page
}

export type GetGroupQuestionListRes = {
  questions: Question[]
  page: Page
}

export type GetGroupTargetListRes = {
  targets: GroupTarget[]
  page: Page
}

export type GetGroupMemberListRes = {
  users: User[]
  page: Page
}
export type GetGroupNameAvailablitiesRes = {
  available: boolean
  recommend: string[]
}
