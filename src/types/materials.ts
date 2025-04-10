export type ImageMeta = {
  width: number
  height: number
  size: number
  thumbnail: string
}

export type VideoMeta = {
  width: number
  height: number
  size: number
  duration: number
  thumbnail: string
}

export type AudioMeta = {
  size: number
  duration: number
}

export type FileMeta = {
  name: string
  size: number
  mime: string
  expires: number
}

export type MaterialType = 'image' | 'video' | 'audio' | 'file'

export type Material = {
  id: number
  type: MaterialType
  url: string
  meta: ImageMeta | VideoMeta | AudioMeta | FileMeta
}

export type Attachment = {
  id: number
  type: string
  url: string
  meta: ImageMeta | VideoMeta | AudioMeta | FileMeta
}
