// import { AvatarApi } from '@/network/api/avatars'
import { API_BASE_URL } from '@/network/utils'

export const getUrlByAvatarId = (avatarId: number) => {
  return API_BASE_URL + '/avatars/' + avatarId
}
