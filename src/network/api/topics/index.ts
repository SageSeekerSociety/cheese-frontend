import ApiInstance from '../index'
import { CreateTopicResponse, SearchTopicsResponse } from './types'

export namespace TopicsApi {
  export const search = (query: string, pageSize = 20) =>
    ApiInstance.request<SearchTopicsResponse>({
      url: '/topics',
      method: 'GET',
      params: { q: query, page_size: pageSize },
    })

  export const create = (name: string) =>
    ApiInstance.request<CreateTopicResponse>({
      url: '/topics',
      method: 'POST',
      data: { name },
    })
}
