import type { Page } from '@/types'
import type {
  CreateDiscussionRequest,
  Discussion,
  DiscussionReactionSummary,
  ListDiscussionsParams,
  ReactionType,
  UpdateDiscussionRequest,
} from './types'

import { NewApiInstance } from '../index'

export namespace DiscussionsApi {
  export const create = (data: CreateDiscussionRequest) =>
    NewApiInstance.request<{ discussion: Discussion }>({
      url: '/discussions',
      method: 'POST',
      data,
    })

  export const list = (params: ListDiscussionsParams) =>
    NewApiInstance.request<{ discussions: Discussion[]; page: Page }>({
      url: '/discussions',
      method: 'GET',
      params,
    })

  export const deleteDiscussion = (discussionId: number) =>
    NewApiInstance.request<{ discussion: Discussion }>({
      url: `/discussions/${discussionId}`,
      method: 'DELETE',
    })

  export const updateDiscussion = (discussionId: number, data: UpdateDiscussionRequest) =>
    NewApiInstance.request<{ discussion: Discussion }>({
      url: `/discussions/${discussionId}`,
      method: 'PATCH',
      data,
    })

  export const reactToDiscussion = (discussionId: number, reactionTypeId: number) =>
    NewApiInstance.request<{ reaction: DiscussionReactionSummary }>({
      url: `/discussions/${discussionId}/reactions/${reactionTypeId}`,
      method: 'POST',
    })

  export const getDetail = (
    discussionId: number,
    params?: {
      pageStart?: number
      pageSize?: number
      sort_by?: 'createdAt' | 'updatedAt'
      sort_order?: 'asc' | 'desc'
    }
  ) =>
    NewApiInstance.request<{
      discussion: Discussion
      subDiscussions: {
        discussions: Discussion[]
        page: Page
      }
    }>({
      url: `/discussions/${discussionId}`,
      method: 'GET',
      params,
    })

  export const getAllReactionTypes = () =>
    NewApiInstance.request<{ reactionTypes: ReactionType[] }>({
      url: '/discussions/reactions',
      method: 'GET',
    })

  export const listSubDiscussions = (
    discussionId: number,
    params?: {
      pageStart?: number
      pageSize?: number
      sort_by?: 'createdAt' | 'updatedAt'
      sort_order?: 'asc' | 'desc'
    }
  ) =>
    NewApiInstance.request<{ discussions: Discussion[]; page: Page }>({
      url: `/discussions/${discussionId}/sub-discussions`,
      method: 'GET',
      params,
    })
}
