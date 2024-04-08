import ApiInstance from '../index'
import { UploadAvatarResponseDataType } from './types'

export namespace AvatarApi {
  export const uploadAvatar = (data: FormData) =>
    ApiInstance.request<UploadAvatarResponseDataType>({
      url: '/avatars',
      method: 'POST',
      data,
    })
}
