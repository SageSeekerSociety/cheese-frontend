import type { NewAttitudeType } from '@/constants'

export type AttitudeStats = {
  positive_count: number
  negative_count: number
  difference: number
  user_attitude?: NewAttitudeType
}

export type Page<C = number> = {
  pageStart?: C
  pageSize: number
  hasMore: boolean
  nextStart?: C
  total?: number
}

export type EncodedCursorPage = Page<string>

export type Topic = {
  id: number
  name: string
}
