export enum ApiErrorClassEnum {
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  AUTH = "auth",
  FORBIDDEN = "forbidden",
  CONFLICT = "conflict",
  RATE_LIMIT = "rate_limit",
  UPSTREAM = "upstream",
  INTERNAL = "internal",
}

export interface IFieldErrorBodyType {
  name: string
  message: string
}

export interface IApiErrorBodyType {
  code: string
  class: ApiErrorClassEnum
  message: string
  fields?: IFieldErrorBodyType[]
  meta?: Record<string, unknown>
}

export interface IApiSuccessEnvelopeType<T> {
  ok: true
  result: T
  correlation_id?: string
}

export interface IApiErrorEnvelopeType {
  ok: false
  error: IApiErrorBodyType
  correlation_id?: string
}
