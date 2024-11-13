import type { Space } from '@/types'
import type {
  GetSpacesResponseData,
  PatchSpaceAdminRequestData,
  PatchSpaceRequestData,
  PostSpaceAdminRequestData,
  PostSpaceRequestData,
} from './types'

import { NewApiInstance } from '../index'

export namespace SpacesApi {
  export const create = (data: PostSpaceRequestData) =>
    NewApiInstance.request<{ space: Space }>({
      url: '/spaces',
      method: 'POST',
      data,
    })

  export const update = (spaceId: number, data: PatchSpaceRequestData) =>
    NewApiInstance.request<{ space: Space }>({
      url: `/spaces/${spaceId}`,
      method: 'PATCH',
      data,
    })

  export const del = (spaceId: number) =>
    NewApiInstance.request({
      url: `/spaces/${spaceId}`,
      method: 'DELETE',
    })

  export const detail = (
    spaceId: number,
    params: { queryClassificationTopics?: boolean; queryMyRank?: boolean } = {}
  ) =>
    NewApiInstance.request<{ space: Space }>({
      url: `/spaces/${spaceId}`,
      method: 'GET',
      params,
    })

  export const list = (params: { page_size?: number; page_start?: number; sort_by: string; sort_order: string }) =>
    NewApiInstance.request<GetSpacesResponseData>({
      url: '/spaces',
      method: 'GET',
      params,
    })

  export const addAdmin = (spaceId: number, data: PostSpaceAdminRequestData) =>
    NewApiInstance.request<{ space: Space }>({
      url: `/spaces/${spaceId}/managers`,
      method: 'POST',
      data,
    })

  export const updateAdmin = (spaceId: number, userId: number, data: PatchSpaceAdminRequestData) =>
    NewApiInstance.request<{ space: Space }>({
      url: `/spaces/${spaceId}/managers/${userId}`,
      method: 'PATCH',
      data,
    })

  export const removeAdmin = (spaceId: number, userId: number) =>
    NewApiInstance.request({
      url: `/spaces/${spaceId}/managers/${userId}`,
      method: 'DELETE',
    })
}
