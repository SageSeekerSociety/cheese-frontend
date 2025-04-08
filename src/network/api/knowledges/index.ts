import type { CreateKnowledgeRequest, Knowledge, ListKnowledgesParams, Page, UpdateKnowledgeRequest } from '@/types'

import { NewApiInstance } from '../index'

export namespace KnowledgesApi {
  export const create = (data: CreateKnowledgeRequest) =>
    NewApiInstance.request<{ knowledge: Knowledge }>({
      url: '/knowledge',
      method: 'POST',
      data,
    })

  export const list = (params: ListKnowledgesParams) => {
    const finalParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => finalParams.append(key, v.toString()))
        } else {
          finalParams.set(key, value.toString())
        }
      }
    })
    return NewApiInstance.request<{ knowledges: Knowledge[]; page: Page }>({
      url: '/knowledge',
      method: 'GET',
      params: finalParams,
    })
  }

  export const getDetail = (knowledgeId: number) =>
    NewApiInstance.request<{ knowledge: Knowledge }>({
      url: `/knowledge/${knowledgeId}`,
      method: 'GET',
    })

  export const update = (knowledgeId: number, data: UpdateKnowledgeRequest) =>
    NewApiInstance.request<{ knowledge: Knowledge }>({
      url: `/knowledge/${knowledgeId}`,
      method: 'PATCH',
      data,
    })

  export const deleteKnowledge = (knowledgeId: number) =>
    NewApiInstance.request<void>({
      url: `/knowledge/${knowledgeId}`,
      method: 'DELETE',
    })
}
