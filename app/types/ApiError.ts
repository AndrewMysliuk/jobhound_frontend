import type { ApiErrorClassEnum, IApiErrorBodyType, IFieldErrorBodyType } from "./IApiEnvelope"

export class ApiError extends Error {
  readonly code: string
  readonly class: ApiErrorClassEnum
  readonly fields: readonly IFieldErrorBodyType[]
  readonly meta: Readonly<Record<string, unknown>>
  readonly status: number
  readonly correlation_id?: string

  constructor(body: IApiErrorBodyType, status: number, correlation_id?: string) {
    super(body.message)
    this.name = "ApiError"
    this.code = body.code
    this.class = body.class
    this.fields = body.fields ?? []
    this.meta = body.meta ?? {}
    this.status = status
    this.correlation_id = correlation_id
  }
}
