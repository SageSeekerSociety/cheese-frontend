export interface ResponseDataType<T = unknown> {
  code: number
  message: string
  data: T
}
