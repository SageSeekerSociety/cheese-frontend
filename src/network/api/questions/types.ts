import type { AttitudeStats, Page, Question, QuestionInvitation, User } from '@/types'

export type QuestionList = {
  questions: Question[]
  page: Page
}

export type AskQuestionResponse = {
  id: number
}

export type QuestionDetailResponse = {
  question: Question
}

export type FollowQuestionResponse = {
  follow_count: number
}

export type AttitudeQuestionResponse = {
  attitudes: AttitudeStats
}

export type QuestionInvitationRecommendResponse = {
  users: User[]
}

export type QuestionInviteUserResponse = {
  invitation_id: number
}

export type GetInvitationsResponse = {
  invitations: QuestionInvitation[]
  page: Page
}
