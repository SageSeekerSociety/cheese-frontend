import { AttitudeStats, ImageMeta, VideoMeta, User } from '.'

export type Insight = {
  id: number
  content: string
  author: User
  created_at: number
  updated_at: number
  attitudes: AttitudeStats
  comment_count: number
  view_count: number
  medias: InsightMedia[]
  attachment?: InsightAttachment
}

export type AttitudeInsightResponse = {
  attitudes: AttitudeStats
}

export type InsightMedia = {
  material_id: number
  created_at: number
  type: 'image' | 'video'
  url: string
  meta: ImageMeta | VideoMeta
}

export type InsightMediaImage = {
  material_id: number
  created_at: number
  type: 'image'
  url: string
  meta: ImageMeta
}

export type InsightMediaVideo = {
  material_id: number
  created_at: number
  type: 'video'
  url: string
  meta: VideoMeta
}

export type InsightAttachment = {
  type: 'file' | 'link'
  url: string
  title: string
  description: string
}

export function isInsightMediaImage(media: InsightMedia): media is InsightMediaImage {
  return media.type === 'image'
}

export function isInsightMediaVideo(media: InsightMedia): media is InsightMediaVideo {
  return media.type === 'video'
}
