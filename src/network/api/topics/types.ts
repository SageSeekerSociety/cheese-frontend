import type { Page, Topic } from '@/types'

export type SearchTopicsResponse = {
  topics: Topic[]
  page: Page
}

export type CreateTopicResponse = {
  id: number
}
