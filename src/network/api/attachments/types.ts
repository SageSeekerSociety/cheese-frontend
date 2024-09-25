import { Attachment } from '@/types'

export type UploadAttachmentRequestData = {
  type: string
  file: File
}

export type UploadAttachmentResponseData = {
  id: number
}

export type GetAttachmentDetailResponse = {
  attachment: Attachment
}
