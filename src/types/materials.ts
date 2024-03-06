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

export type Material = {
  id: number
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  meta: ImageMeta | VideoMeta | AudioMeta | FileMeta
}
