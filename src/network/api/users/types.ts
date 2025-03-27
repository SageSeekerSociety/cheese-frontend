import type { Answer, Page, Question, User } from '@/types'

export type { Page }

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

// 实名信息类型
export interface RealNameInfo {
  realName: string
  studentId: string
  grade: string
  major: string
  className: string
  phone?: string
  email?: string
  isEncrypted?: boolean
}

// 实名信息访问模块类型
export enum UserIdentityAccessModuleType {
  TASK = 'TASK',
}

// 实名信息访问类型
export enum UserIdentityAccessType {
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
}

// 实名信息访问日志
export interface UserIdentityAccessLog {
  accessor: User
  accessModuleType?: UserIdentityAccessModuleType
  accessEntityId?: number
  accessEntityName?: string
  accessTime: number
  accessType: UserIdentityAccessType
  ipAddress: string
}

export type GetRealNameInfoResponse = {
  hasIdentity: boolean
  identity?: RealNameInfo
}

export type UpdateRealNameInfoResponse = {
  success: boolean
  realNameInfo: RealNameInfo
}
