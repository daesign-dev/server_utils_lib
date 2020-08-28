export interface IHttpResult<T> {
  code: number
  message?: string
  name?: string
  stack?: string
  meta?: {
    count: number
    nb: number
    pageSize: number
    offset: number
    mongoquery?: any
  }
  response: T[]
}
