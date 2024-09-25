import ApiInstance from '../index'
import { GetAttachmentDetailResponse, UploadAttachmentRequestData, UploadAttachmentResponseData } from './types'

export namespace AttachmentsApi {
  export const upload = (data: UploadAttachmentRequestData) => {
    const formData = new FormData()
    formData.append('type', data.type)
    formData.append('file', data.file)

    return ApiInstance.request<UploadAttachmentResponseData>({
      url: '/attachments',
      method: 'POST',
      data: formData,
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
