export interface ResponseDataType<T = unknown> {
  code: number
  message: string
  data: T
  error?: {
    name: string
    message: string
    data?: any
  }
}
