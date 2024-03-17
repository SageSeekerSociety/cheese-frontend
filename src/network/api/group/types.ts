import { Group, Page, Question, GroupTarget, User, GroupMember } from '@/types'

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
  members: GroupMember[]
  page: Page
}
export type GetGroupNameAvailablitiesRes = {
  available: boolean
  recommend: string[]
}
