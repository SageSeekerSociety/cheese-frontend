import { Avatar, AvatarType } from '@/types'
import ApiInstance from '../index'

export namespace AvatarsApi {
  export type GetAvailableAvatarIdsParams = {
    type?: AvatarType
  }

  export type GetAvailableAvatarIdsResponse = {
    avatarIds: number[]
  }

  export type CreateAvatarResponse = {
    avatarId: number
  }

  export const getAvailableAvatarIds = (params: GetAvailableAvatarIdsParams = {}) =>
    ApiInstance.request<GetAvailableAvatarIdsResponse>({
      url: '/avatars',
      method: 'GET',
      params,
    })

  export const createAvatar = (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return ApiInstance.request<CreateAvatarResponse>({
      url: '/avatars',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  export const getDefaultAvatar = () =>
    ApiInstance.request<Blob>({
      url: '/avatars/default',
      method: 'GET',
      responseType: 'blob',
    })

  export const getAvatar = (id: number) =>
    ApiInstance.request<Blob>({
      url: `/avatars/${id}`,
      method: 'GET',
      responseType: 'blob',
    })
}
