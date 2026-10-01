import { ApiError, ApiErrorClassEnum, type IFieldErrorBodyType } from "~/types"

const CLASS_FALLBACK_MESSAGE: Record<ApiErrorClassEnum, string> = {
  [ApiErrorClassEnum.VALIDATION]: "The request is invalid.",
  [ApiErrorClassEnum.NOT_FOUND]: "Not found.",
  [ApiErrorClassEnum.AUTH]: "Could not confirm access.",
  [ApiErrorClassEnum.FORBIDDEN]: "You do not have permission for this action.",
  [ApiErrorClassEnum.CONFLICT]: "This action conflicts with the current state.",
  [ApiErrorClassEnum.RATE_LIMIT]: "Too many requests. Try again later.",
  [ApiErrorClassEnum.UPSTREAM]: "An external service is temporarily unavailable. Try again later.",
  [ApiErrorClassEnum.INTERNAL]: "Something went wrong. Try again later.",
}

const NETWORK_FALLBACK_MESSAGE = "Network error. Try again later."
const UNEXPECTED_RESPONSE_FALLBACK_MESSAGE = "The server returned an unexpected response. Try again later."

const VALIDATION_FAILED_CODE = "VALIDATION.FAILED"
const INTERNAL_UNEXPECTED_CODE = "INTERNAL.UNEXPECTED"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isApiErrorClass(value: unknown): value is ApiErrorClassEnum {
  return typeof value === "string" && (Object.values(ApiErrorClassEnum) as string[]).includes(value)
}

function classFromStatus(status: number): ApiErrorClassEnum {
  if (status === 400) return ApiErrorClassEnum.VALIDATION
  if (status === 401) return ApiErrorClassEnum.AUTH
  if (status === 403) return ApiErrorClassEnum.FORBIDDEN
  if (status === 404) return ApiErrorClassEnum.NOT_FOUND
  if (status === 409) return ApiErrorClassEnum.CONFLICT
  if (status === 429) return ApiErrorClassEnum.RATE_LIMIT
  if (status === 502 || status === 503) return ApiErrorClassEnum.UPSTREAM

  return ApiErrorClassEnum.INTERNAL
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value
    }
  }

  return undefined
}

function fallbackCodeForClass(errorClass: ApiErrorClassEnum): string {
  if (errorClass === ApiErrorClassEnum.VALIDATION) {
    return VALIDATION_FAILED_CODE
  }

  return INTERNAL_UNEXPECTED_CODE
}

function headerValue(headers: unknown, name: string): string | undefined {
  if (headers instanceof Headers) {
    const raw = headers.get(name)
    return raw && raw !== "" ? raw : undefined
  }

  if (!isRecord(headers)) {
    return undefined
  }

  const raw = headers[name] ?? headers[name.toLowerCase()]

  if (typeof raw === "string" && raw !== "") {
    return raw
  }

  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0] !== "") {
    return raw[0]
  }

  return undefined
}

function isHtmlResponse(data: unknown, contentType: string | undefined): boolean {
  if (contentType?.includes("text/html")) {
    return true
  }

  if (typeof data !== "string") {
    return false
  }

  const trimmed = data.trimStart().toLowerCase()

  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")
}

function correlationIdFromBodyOrHeaders(data: unknown, headers: unknown): string | undefined {
  if (isRecord(data) && typeof data.correlation_id === "string" && data.correlation_id !== "") {
    return data.correlation_id
  }

  return headerValue(headers, "x-correlation-id")
}

function buildApiError(
  partial: { code?: string; class?: ApiErrorClassEnum; message?: string; fields?: IFieldErrorBodyType[]; meta?: Record<string, unknown> },
  status: number,
  correlationId?: string
): ApiError {
  const errorClass = partial.class ?? classFromStatus(status)
  const code = firstNonEmpty(partial.code) ?? fallbackCodeForClass(errorClass)
  const message = firstNonEmpty(partial.message, CLASS_FALLBACK_MESSAGE[errorClass]) ?? CLASS_FALLBACK_MESSAGE[ApiErrorClassEnum.INTERNAL]

  return new ApiError(
    {
      code,
      class: errorClass,
      message,
      fields: partial.fields ?? [],
      meta: partial.meta ?? {},
    },
    status,
    correlationId
  )
}

function fromErrorEnvelope(data: Record<string, unknown>, status: number, correlationId?: string): ApiError {
  const error = isRecord(data.error) ? data.error : {}
  const fields = Array.isArray(error.fields) ? error.fields.filter((field): field is IFieldErrorBodyType => isRecord(field) && typeof field.name === "string" && typeof field.message === "string") : []

  return buildApiError(
    {
      code: typeof error.code === "string" ? error.code : undefined,
      class: isApiErrorClass(error.class) ? error.class : undefined,
      message: typeof error.message === "string" ? error.message : undefined,
      fields,
      meta: isRecord(error.meta) ? error.meta : {},
    },
    status,
    correlationId ?? (typeof data.correlation_id === "string" ? data.correlation_id : undefined)
  )
}

function localFallbackError(message: string, status = 0): ApiError {
  return new ApiError(
    {
      code: INTERNAL_UNEXPECTED_CODE,
      class: ApiErrorClassEnum.INTERNAL,
      message,
      fields: [],
      meta: {},
    },
    status
  )
}

function fromHttpFailure(status: number, data: unknown, headers: unknown): ApiError {
  const contentType = headerValue(headers, "content-type")
  const correlationId = correlationIdFromBodyOrHeaders(data, headers)

  if (isHtmlResponse(data, contentType) || typeof data === "string") {
    return localFallbackError(UNEXPECTED_RESPONSE_FALLBACK_MESSAGE, status)
  }

  if (isRecord(data) && isRecord(data.error)) {
    return fromErrorEnvelope(data, status, correlationId)
  }

  return buildApiError({}, status, correlationId)
}

function isHttpFailureLike(value: Record<string, unknown>): boolean {
  return "data" in value || (typeof value.status === "number" && !isRecord(value.error))
}

function causedApiError(value: unknown): ApiError | undefined {
  if (isRecord(value) && value.cause instanceof ApiError) {
    return value.cause
  }

  return undefined
}

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) {
    return e
  }

  const caused = causedApiError(e)
  if (caused) {
    return caused
  }

  if (isRecord(e) && isRecord(e.error)) {
    const status = typeof e.status === "number" ? e.status : 0
    const correlationId = typeof e.correlation_id === "string" && e.correlation_id !== "" ? e.correlation_id : headerValue(e.headers, "x-correlation-id")

    return fromErrorEnvelope(e, status, correlationId)
  }

  if (isRecord(e) && isHttpFailureLike(e)) {
    const status = typeof e.status === "number" ? e.status : 0

    return fromHttpFailure(status, "data" in e ? e.data : undefined, e.headers)
  }

  if (e instanceof SyntaxError || (e instanceof Error && e.message === "Expected API success envelope")) {
    return localFallbackError(UNEXPECTED_RESPONSE_FALLBACK_MESSAGE)
  }

  return localFallbackError(NETWORK_FALLBACK_MESSAGE)
}
