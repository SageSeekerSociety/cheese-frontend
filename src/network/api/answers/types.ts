import { Answer, AttitudeStats, Question, Page } from '@/types'

export type AttitudeAnswerResponse = {
  attitudes: AttitudeStats
}

export type GetAnswerDetailResponse = {
  question: Question
  answer: Answer
}

export type AnswerQuestionResponse = {
  id: number
}

export type GetAnswersResponse = {
  answers: Answer[]
  page: Page
}
