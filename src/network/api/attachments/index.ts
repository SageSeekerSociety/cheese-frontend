import type { AxiosProgressEvent } from 'axios'
import type { GetAttachmentDetailResponse, UploadAttachmentRequestData, UploadAttachmentResponseData } from './types'

import ApiInstance from '../index'

export namespace AttachmentsApi {
  export const upload = (
    data: UploadAttachmentRequestData,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ) => {
    const formData = new FormData()
    formData.append('type', data.type)
    formData.append('file', data.file)

    return ApiInstance.request<UploadAttachmentResponseData>({
      url: '/attachments',
      method: 'POST',
      data: formData,
      timeout: 60000,
      onUploadProgress: onProgress,
      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
    })
  }

  export const detail = (id: number) =>
    ApiInstance.request<GetAttachmentDetailResponse>({
      url: `/attachments/${id}`,
      method: 'GET',
    })
}
