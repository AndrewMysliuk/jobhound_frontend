/** Nested error object in JSON (`internal/publicapi/schema/errors.go`). */
export interface IAPIErrorDetail {
  code: string
  message: string
}

/** Standard non-2xx JSON envelope: `{ "error": { "code", "message" } }`. */
export interface IAPIErrorBody {
  error: IAPIErrorDetail
}

/** POST /api/v1/slots 409 when slot cap is exceeded. */
export interface ISlotLimitReachedBody {
  error: IAPIErrorDetail
  limit: number
}

export const isAPIErrorBody = (v: unknown): v is IAPIErrorBody => {
  if (typeof v !== "object" || v === null || !("error" in v)) return false
  const err = (v as IAPIErrorBody).error
  return typeof err?.code === "string" && typeof err?.message === "string"
}

export const isSlotLimitReachedBody = (v: unknown): v is ISlotLimitReachedBody => {
  return isAPIErrorBody(v) && "limit" in v && typeof (v as ISlotLimitReachedBody).limit === "number"
}

export class ApiError extends Error {
  readonly code: string
  /** Set when `isSlotLimitReachedBody` applies (HTTP 409). */
  readonly slotLimit?: number

  constructor(code: string, message: string, options?: ErrorOptions & { slotLimit?: number }) {
    super(message, options)
    this.name = "ApiError"
    this.code = code
    this.slotLimit = options?.slotLimit
  }

  static fromAPIErrorBody(r: IAPIErrorBody): ApiError {
    return new ApiError(r.error.code, r.error.message)
  }

  static fromSlotLimitReached(r: ISlotLimitReachedBody): ApiError {
    return new ApiError(r.error.code, r.error.message, { slotLimit: r.limit })
  }
}
