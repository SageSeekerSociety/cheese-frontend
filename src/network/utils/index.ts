import type { AxiosResponse } from 'axios'
import type { ResponseDataType } from '../types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const NEW_API_BASE_URL = import.meta.env.VITE_NEW_API_BASE_URL

export function isAxiosResponse<T>(res: AxiosResponse<T> | ResponseDataType<T>): res is AxiosResponse<T> {
  return (res as AxiosResponse<T>).status !== undefined
}
