import type { Space, SpaceCategory } from '@/types'
import type {
  GetSpacesResponseData,
  PatchSpaceAdminRequestData,
  PatchSpaceCategoryRequestData,
  PatchSpaceRequestData,
  PostSpaceAdminRequestData,
  PostSpaceCategoryRequestData,
  PostSpaceRequestData,
  PublisherParticipation,
  SpaceAnalyticsTasksData,
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

  export const list = (params: { pageSize?: number; pageStart?: number; sort_by: string; sort_order: string }) =>
    NewApiInstance.request<GetSpacesResponseData>({
      url: '/spaces',
      method: 'GET',
      params,
    })

  export const getAnalyticsTasks = (
    spaceId: number,
    params?: Partial<{
      successBy: 'completion' | 'approve'
      from: number
      to: number
      taskStatus: string
      categoryId: number
      realName: 'all' | 'with' | 'without'
      publisherId: number
    }>
  ) =>
    NewApiInstance.request<SpaceAnalyticsTasksData>({
      url: `/spaces/${spaceId}/analytics/tasks`,
      method: 'GET',
      params,
    })

  export const getPublishersParticipation = (spaceId: number, successBy: 'completion' | 'approve' = 'completion') =>
    NewApiInstance.request<PublisherParticipation[]>({
      url: `/spaces/${spaceId}/publishers/participation`,
      method: 'GET',
      params: { successBy },
    })

  // 导出参与者（CSV 或后续支持 Excel）
  // 返回 AxiosResponse<Blob> 更适合文件下载，但这里直接返回 ResponseDataType<void>
  // 实际下载放在视图中用 fetch 处理 Authorization 并保存文件

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

  // Categories API
  export const listCategories = (spaceId: number, params: { includeArchived?: boolean } = {}) =>
    NewApiInstance.request<{ categories: SpaceCategory[] }>({
      url: `/spaces/${spaceId}/categories`,
      method: 'GET',
      params,
    })

  export const createCategory = (spaceId: number, data: PostSpaceCategoryRequestData) =>
    NewApiInstance.request<{ category: SpaceCategory }>({
      url: `/spaces/${spaceId}/categories`,
      method: 'POST',
      data,
    })

  export const getCategory = (spaceId: number, categoryId: number) =>
    NewApiInstance.request<{ category: SpaceCategory }>({
      url: `/spaces/${spaceId}/categories/${categoryId}`,
      method: 'GET',
    })

  export const updateCategory = (spaceId: number, categoryId: number, data: PatchSpaceCategoryRequestData) =>
    NewApiInstance.request<{ category: SpaceCategory }>({
      url: `/spaces/${spaceId}/categories/${categoryId}`,
      method: 'PATCH',
      data,
    })

  export const deleteCategory = (spaceId: number, categoryId: number) =>
    NewApiInstance.request({
      url: `/spaces/${spaceId}/categories/${categoryId}`,
      method: 'DELETE',
    })

  export const archiveCategory = (spaceId: number, categoryId: number) =>
    NewApiInstance.request<{ category: SpaceCategory }>({
      url: `/spaces/${spaceId}/categories/${categoryId}/archive`,
      method: 'POST',
    })

  export const unarchiveCategory = (spaceId: number, categoryId: number) =>
    NewApiInstance.request<{ category: SpaceCategory }>({
      url: `/spaces/${spaceId}/categories/${categoryId}/archive`,
      method: 'DELETE',
    })
}
