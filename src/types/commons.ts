import type { NewAttitudeType } from '@/constants'

export type AttitudeStats = {
  positive_count: number
  negative_count: number
  difference: number
  user_attitude?: NewAttitudeType
}

export type Page = {
  page_start: number
  page_size: number
  has_prev: boolean
  prev_start: number
  has_more: boolean
  next_start: number
}

export type Topic = {
  id: number
  name: string
}
