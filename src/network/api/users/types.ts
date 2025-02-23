import type { Answer, Page, Question, User } from '@/types'

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

export type PasskeyRegistrationOptionsResponse = {
  options: any // 根据实际返回类型调整
}

export type PasskeyAuthenticationOptionsResponse = {
  options: any // 根据实际返回类型调整
}

export type PasskeyInfo = {
  id: string
  createdAt: Date
  deviceType: string
  backedUp: boolean
}

export type GetPasskeysResponse = {
  passkeys: PasskeyInfo[]
}

export type AuthMethodsResponse = {
  supports_srp: boolean
  supports_passkey: boolean
  supports_2fa: boolean
  requires_2fa: boolean
}

export type SrpInitResponse = {
  salt: string
  serverPublicEphemeral: string
}

export type SrpVerifyResponse = {
  serverProof: string
  accessToken?: string
  requires2FA: boolean
  tempToken?: string
  user?: User
}

export interface TokenPayload {
  payload: {
    authorization: {
      userId: number
      permissions: string[]
      sudoUntil?: number
      username?: string
    }
    signedAt: number
    validUntil: number
  }
}
