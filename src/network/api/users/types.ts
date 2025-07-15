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

// OAuth 相关类型定义
export interface OAuthProvider {
  id: string
  name: string
  scope: string[]
}

export type GetOAuthProvidersResponse = {
  providers: OAuthProvider[]
}

// OAuth 验证请求类型
export interface OAuthVerifyRequest {
  sessionId: string
  // 密码验证
  password?: string
  // SRP 验证
  clientPublicEphemeral?: string
  clientProof?: string
}

// OAuth 状态信息类型
export interface OAuthState {
  providerId: string
  userInfo: {
    id: string
    email: string | null
    name: string
    preferredUsername: string
  }
  suggestedUsername: string
  suggestedNickname: string
  emailConflict: boolean
}

export type GetOAuthStateResponse = {
  providerId: string
  userInfo: {
    id: string
    email: string | null
    name: string
    preferredUsername: string
  }
  suggestedUsername: string
  suggestedNickname: string
  emailConflict: boolean
}

// OAuth 创建用户请求类型
export interface OAuthCreateUserRequest {
  stateToken: string
  username: string
  nickname: string
  passwordMode: 'none' | 'srp' // 支持纯OAuth模式和SRP密码模式
  // SRP 模式下的可选参数
  srpSalt?: string
  srpVerifier?: string
}

export type OAuthCreateUserResponse = {
  user: {
    id: number
    username: string
    email: string
    nickname: string
  }
  token: string
}

// OAuth 绑定用户请求类型 (传统方式)
export interface OAuthBindUserRequest {
  stateToken: string
  username: string
  password: string
}

export type OAuthBindUserResponse = {
  user: {
    id: number
    username: string
    email: string
  }
  token: string
}

// SRP 绑定初始化请求类型
export interface OAuthSrpBindInitRequest {
  stateToken: string
  username: string
  clientPublicEphemeral: string
}

export type OAuthSrpBindInitResponse = {
  sessionId: string
  salt: string
  serverPublicEphemeral: string
}

// SRP 绑定验证请求类型
export interface OAuthSrpBindVerifyRequest {
  sessionId: string
  clientPublicEphemeral: string
  clientProof: string
}

export type OAuthSrpBindVerifyResponse = {
  user: {
    id: number
    username: string
    email: string
  }
  token: string
}

// OAuth 绑定连接响应类型
export interface OAuthConnection {
  id: number
  providerId: string
  providerName: string
  providerUserId: string
  connectedAt: string
}

export type GetOAuthConnectionsResponse = {
  connections: OAuthConnection[]
}

export type InitOAuthBindingResponse = {
  success: boolean
  provider: string
  bindUrl: string
}

export type UnbindOAuthConnectionResponse = {
  success: boolean
  unboundConnectionId: number
}
