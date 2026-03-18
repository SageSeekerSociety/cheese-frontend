import type { Space, SpaceCategory, Topic } from '@/types'
import type {
  AnalyticsApproveType,
  AnalyticsCompletionType,
  AnalyticsGroupBy,
  AnalyticsRealNameType,
  AnalyticsSortOrder,
  GetSpacesResponseData,
  PatchSpaceAdminRequestData,
  PatchSpaceCategoryRequestData,
  PatchSpaceRequestData,
  PostSpaceAdminRequestData,
  PostSpaceCategoryRequestData,
  PostSpaceRequestData,
  SpaceAnalyticsAlerts,
  SpaceAnalyticsOverview,
  SpaceAnalyticsParticipants,
  SpaceAnalyticsPublishers,
  SpaceTaskAnalytics,
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

  export const getAnalyticsOverview = (
    spaceId: number,
    params?: Partial<{
      from: number
      to: number
      categoryId: number
      publisherId: number
      taskApproved: AnalyticsApproveType
      groupBy: AnalyticsGroupBy
    }>
  ) =>
    NewApiInstance.request<SpaceAnalyticsOverview>({
      url: `/spaces/${spaceId}/analytics/overview`,
      method: 'GET',
      params,
    })

  export const getAnalyticsAlerts = (spaceId: number) =>
    NewApiInstance.request<SpaceAnalyticsAlerts>({
      url: `/spaces/${spaceId}/analytics/alerts`,
      method: 'GET',
    })

  export const getAnalyticsPublishers = (
    spaceId: number,
    params?: Partial<{
      from: number
      to: number
      categoryId: number
      taskApproved: AnalyticsApproveType
      sortBy: 'taskCount' | 'participantCount' | 'successRate' | 'lastTaskCreatedAt'
      sortOrder: AnalyticsSortOrder
    }>
  ) =>
    NewApiInstance.request<SpaceAnalyticsPublishers>({
      url: `/spaces/${spaceId}/analytics/publishers`,
      method: 'GET',
      params,
    })

  export const getAnalyticsTasks = (
    spaceId: number,
    params?: Partial<{
      from: number
      to: number
      categoryId: number
      publisherId: number
      taskApproved: AnalyticsApproveType
      hasPendingReview: boolean
      hasPendingApproval: boolean
      sortBy: 'createdAt' | 'participantCount' | 'successRate' | 'pendingReviewCount'
      sortOrder: AnalyticsSortOrder
    }>
  ) =>
    NewApiInstance.request<SpaceTaskAnalytics>({
      url: `/spaces/${spaceId}/analytics/tasks`,
      method: 'GET',
      params,
    })

  export const getAnalyticsParticipants = (
    spaceId: number,
    params?: Partial<{
      from: number
      to: number
      categoryId: number
      publisherId: number
      taskApproved: AnalyticsApproveType
      participationApproved: AnalyticsApproveType
      completionStatus: AnalyticsCompletionType
      realName: AnalyticsRealNameType
      groupBy: AnalyticsGroupBy
    }>
  ) =>
    NewApiInstance.request<SpaceAnalyticsParticipants>({
      url: `/spaces/${spaceId}/analytics/participants`,
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

  export const getSpaceTopics = (spaceId: number, limit = 10, sort?: 'popularity' | 'name', keyword?: string) =>
    NewApiInstance.request<{ topics: Topic[] }>({
      url: `/spaces/${spaceId}/topics`,
      method: 'GET',
      params: { limit, sort, keyword },
    })
}
