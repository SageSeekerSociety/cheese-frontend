import Api from '..'

import ApiInstance from './index'

export namespace ImageApi {
  export const upload = (data: FormData) =>
    ApiInstance.request({
      url: '/images',
      method: 'POST',
      data,
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
}
