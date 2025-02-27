import type { User } from '@/types'
import type {
  AuthMethodsResponse,
  FollowUserResponse,
  GetAnswerListResponse,
  GetPasskeysResponse,
  GetQuestionListResponse,
  GetUserInfoResponse,
  PasskeyAuthenticationOptionsResponse,
  PasskeyInfo,
  PasskeyRegistrationOptionsResponse,
  SrpInitResponse,
  SrpVerifyResponse,
  UserList,
} from './types'

import ApiInstance from '../index'

export namespace UserApi {
  export interface AuthResponseDataType {
    user?: User
    accessToken?: string
    requires2FA?: boolean
    tempToken?: string
  }

  export type RegisterResponseDataType = {
    user: User
  }

  export const register = (data: {
    username: string
    nickname: string
    srpSalt: string
    srpVerifier: string
    email: string
    emailCode: string
  }) =>
    ApiInstance.request<RegisterResponseDataType>({
      url: '/users',
      method: 'POST',
      data,
      withCredentials: true,
    })

  export const login = (data: { username: string; password: string }) =>
    ApiInstance.request<AuthResponseDataType>({
      url: '/users/auth/login',
      method: 'POST',
      data,
      withCredentials: true,
    })

  export const sendEmailCode = (email: string) =>
    ApiInstance.request({
      url: '/users/verify/email',
      method: 'POST',
      data: { email },
    })

  export const refreshAccessToken = () =>
    ApiInstance.request<AuthResponseDataType>({
      url: '/users/auth/refresh-token',
      method: 'POST',
      withCredentials: true,
    })

  export const recoverPasswordRequest = (email: string) =>
    ApiInstance.request({
      url: '/users/recover/password/request',
      method: 'POST',
      data: { email },
    })

  export const recoverPasswordVerify = (data: { token: string; srpSalt: string; srpVerifier: string }) =>
    ApiInstance.request({
      url: '/users/recover/password/verify',
      method: 'POST',
      data,
    })

  export const getUserInfo = (userid: number) =>
    ApiInstance.request<GetUserInfoResponse>({
      // url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/users/${userid}`,
      url: `/users/${userid}`,
      method: 'GET',
    })

  export const updateUserInfo = (userid: number, data: { nickname: string; intro: string; avatarId: number }) =>
    ApiInstance.request({
      url: `/users/${userid}`,
      method: 'PUT',
      data,
    })

  export const getUserFollower = (userid: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<UserList>({
      // url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/users/${userid}/followers`,
      url: `/users/${userid}/followers`,
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
      },
    })

  export const getUserFollowing = (userid: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<UserList>({
      // url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/users/${userid}/follow/users`,
      url: `/users/${userid}/follow/users`,
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
      },
    })

  export const getQuestionList = (userId: number, pageStart?: number, pageSize: number = 20) =>
    ApiInstance.request<GetQuestionListResponse>({
      // url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/users/${userid}/questions`,
      url: `/users/${userId}/questions`,
      method: 'GET',
      data: {
        page_start: pageStart,
        page_size: pageSize,
      },
    })

  export const getAnswerList = (userid: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<GetAnswerListResponse>({
      // url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/users/${userid}/answers`,
      url: `/users/${userid}/answers`,
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
      },
    })

  export const followUser = (userId: number) =>
    ApiInstance.request<FollowUserResponse>({
      url: `/users/${userId}/followers`,
      method: 'POST',
    })

  export const unfollowUser = (userId: number) =>
    ApiInstance.request<FollowUserResponse>({
      url: `/users/${userId}/followers`,
      method: 'DELETE',
    })

  // Passkey 注册相关
  export const getPasskeyRegistrationOptions = (userId: number) =>
    ApiInstance.request<{ options: any }>({
      url: `/users/${userId}/passkeys/options`,
      method: 'POST',
      withCredentials: true,
    })

  export const verifyPasskeyRegistration = (userId: number, response: any) =>
    ApiInstance.request({
      url: `/users/${userId}/passkeys`,
      method: 'POST',
      data: { response },
      withCredentials: true,
    })

  // Passkey 认证相关
  export const getPasskeyAuthenticationOptions = (userId?: number) =>
    ApiInstance.request<{ options: any }>({
      url: '/users/auth/passkey/options',
      method: 'POST',
      data: { userId },
      withCredentials: true,
    })

  export const verifyPasskeyAuthentication = (response: any) =>
    ApiInstance.request<AuthResponseDataType>({
      url: '/users/auth/passkey/verify',
      method: 'POST',
      data: { response },
      withCredentials: true,
    })

  // Passkey 管理相关
  export const getUserPasskeys = (userId: number) =>
    ApiInstance.request<GetPasskeysResponse>({
      url: `/users/${userId}/passkeys`,
      method: 'GET',
    })

  export const deletePasskey = (userId: number, credentialId: string) =>
    ApiInstance.request({
      url: `/users/${userId}/passkeys/${credentialId}`,
      method: 'DELETE',
    })

  export type VerifySudoResponse = {
    accessToken: string
  }

  export const verifySudoPassword = (password: string) =>
    ApiInstance.request<VerifySudoResponse & { srpUpgraded?: boolean }>({
      url: '/users/auth/sudo',
      method: 'POST',
      data: {
        method: 'password',
        credentials: { password },
      },
    })

  export const verifySudoPasskey = (response: any) =>
    ApiInstance.request<VerifySudoResponse>({
      url: '/users/auth/sudo',
      method: 'POST',
      data: {
        method: 'passkey',
        credentials: { passkeyResponse: response },
      },
      withCredentials: true,
    })

  export const logout = () =>
    ApiInstance.request({
      url: '/users/auth/logout',
      method: 'POST',
      withCredentials: true,
    })

  export interface TOTPAuthResponseDataType extends AuthResponseDataType {
    requires2FA: boolean
    usedBackupCode: boolean
  }

  export interface Enable2FAResponseDataType {
    secret: string
    otpauth_url: string
    qrcode: string
    backup_codes: string[]
  }

  export interface GenerateBackupCodesResponseDataType {
    backup_codes: string[]
  }

  // TOTP 验证相关
  export const verify2FA = (data: { temp_token: string; code: string }) =>
    ApiInstance.request<TOTPAuthResponseDataType>({
      url: '/users/auth/verify-2fa',
      method: 'POST',
      data,
      withCredentials: true,
    })

  // TOTP 管理相关
  export const initializeTOTP = (userId: number) =>
    ApiInstance.request<Enable2FAResponseDataType>({
      url: `/users/${userId}/2fa/enable`,
      method: 'POST',
    })

  export const enableTOTP = (userId: number, data: { code: string; secret: string }) =>
    ApiInstance.request<Enable2FAResponseDataType>({
      url: `/users/${userId}/2fa/enable`,
      method: 'POST',
      data,
    })

  export const disableTOTP = (userId: number) =>
    ApiInstance.request({
      url: `/users/${userId}/2fa/disable`,
      method: 'POST',
    })

  export const generateBackupCodes = (userId: number) =>
    ApiInstance.request<GenerateBackupCodesResponseDataType>({
      url: `/users/${userId}/2fa/backup-codes`,
      method: 'POST',
    })

  export interface Get2FAStatusResponseDataType {
    enabled: boolean
    has_passkey: boolean
    always_required: boolean
  }

  export interface Update2FASettingsResponseDataType {
    success: boolean
    always_required: boolean
  }

  // 获取 2FA 状态
  export const get2FAStatus = (userId: number) =>
    ApiInstance.request<Get2FAStatusResponseDataType>({
      url: `/users/${userId}/2fa/status`,
      method: 'GET',
    })

  // 添加更新 2FA 设置的方法
  export const update2FASettings = (userId: number, alwaysRequired: boolean) =>
    ApiInstance.request<Update2FASettingsResponseDataType>({
      url: `/users/${userId}/2fa/settings`,
      method: 'PUT',
      data: { always_required: alwaysRequired },
    })

  export const verifySudoTOTP = (code: string) =>
    ApiInstance.request<VerifySudoResponse>({
      url: '/users/auth/sudo',
      method: 'POST',
      data: {
        method: 'totp',
        credentials: { code },
      },
    })

  // 获取认证方法
  export const getAuthMethods = (username: string) =>
    ApiInstance.request<AuthMethodsResponse>({
      url: `/users/auth/methods/${username}`,
      method: 'GET',
    })

  // SRP 初始化
  export const srpInit = (data: { username: string; clientPublicEphemeral: string }) =>
    ApiInstance.request<SrpInitResponse>({
      url: '/users/auth/srp/init',
      method: 'POST',
      data,
      withCredentials: true,
    })

  // SRP 验证
  export const srpVerify = (data: { username: string; clientProof: string }) =>
    ApiInstance.request<SrpVerifyResponse>({
      url: '/users/auth/srp/verify',
      method: 'POST',
      data,
      withCredentials: true,
    })

  export const changePassword = (
    userId: number,
    data: {
      srpSalt: string
      srpVerifier: string
    }
  ) =>
    ApiInstance.request({
      url: `/users/${userId}/password`,
      method: 'PATCH',
      data,
    })

  export const verifySudoSrpInit = (data: { clientPublicEphemeral: string }) =>
    ApiInstance.request<{
      salt: string
      serverPublicEphemeral: string
    }>({
      url: '/users/auth/sudo',
      method: 'POST',
      data: {
        method: 'srp',
        credentials: data,
      },
      withCredentials: true,
    })

  export const verifySudoSrpVerify = (data: { clientProof: string }) =>
    ApiInstance.request<{
      serverProof: string
      accessToken: string
    }>({
      url: '/users/auth/sudo',
      method: 'POST',
      data: {
        method: 'srp',
        credentials: data,
      },
      withCredentials: true,
    })
}
