import ApiInstance from '../index'
import { User } from '@/types/users'
import { GetAnswerListResponse, GetQuestionListResponse, UserList } from './types'

export namespace UserApi {
  export interface AuthResponseDataType {
    user: User
    accessToken: string
  }

  export type RegisterResponseDataType = AuthResponseDataType

  export const register = (data: {
    username: string
    nickname: string
    password: string
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

  export const recoverPasswordVerify = (data: { token: string; newPassword: string }) =>
    ApiInstance.request({
      url: '/users/recover/password/verify',
      method: 'POST',
      data: {
        token: data.token,
        new_password: data.newPassword,
      },
    })

  export const getUserInfo = (userid: number) =>
    ApiInstance.request<User>({
      // url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/users/${userid}`,
      url: `/users/${userid}`,
      method: 'GET',
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

  export const getQuestionList = (userid: number, data: { pageStart: number; pageSize: number }) =>
    ApiInstance.request<GetQuestionListResponse>({
      // url: `https://stoplight.io/mocks/huanchengstudio/cheese/2398548/users/${userid}/questions`,
      url: `/users/${userid}/questions`,
      method: 'GET',
      data: {
        pageStart: data.pageStart,
        pageSize: data.pageSize,
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
}
