import type { NewAttitudeType } from '@/constants'

export type AttitudeStats = {
  positive_count: number
  negative_count: number
  difference: number
  user_attitude?: NewAttitudeType
}

export type Page = {
  pageStart: number
  pageSize: number
  hasMore: boolean
  nextStart: number
  total?: number
}

export type Topic = {
  id: number
  name: string
}
