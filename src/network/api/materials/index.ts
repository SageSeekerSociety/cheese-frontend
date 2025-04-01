import type { Material } from '@/types'

import { AxiosProgressEvent } from 'axios'

import ApiInstance from '../index'

export namespace MaterialsApi {
  export const upload = (file: File, type: string, onProgress?: (progressEvent: AxiosProgressEvent) => void) => {
    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', file)

    return ApiInstance.request<{ id: number }>({
      url: '/materials',
      method: 'POST',
      data: formData,
      timeout: 60000,
      onUploadProgress: onProgress,
      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
    })
  }

  export const getDetail = (materialId: number) =>
    ApiInstance.request<{ material: Material }>({
      url: `/materials/${materialId}`,
      method: 'GET',
    })
}
