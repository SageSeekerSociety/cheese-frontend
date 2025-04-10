import type { CreateTopicResponse, SearchTopicsResponse } from './types'

import ApiInstance from '../index'

export namespace TopicsApi {
  export const search = (query: string, pageSize = 20) =>
    ApiInstance.request<SearchTopicsResponse>({
      url: '/topics',
      method: 'GET',
      params: { q: query, pageSize: pageSize },
    })

  export const create = (name: string) =>
    ApiInstance.request<CreateTopicResponse>({
      url: '/topics',
      method: 'POST',
      data: { name },
    })
}
