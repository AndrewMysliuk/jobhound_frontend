import { describe, expect, it } from "vitest"

import { ApiError, ApiErrorClassEnum } from "~/types"
import { toApiError } from "~/utils/toApiError"
import { unwrapApiResult } from "~/utils/unwrapApiResult"

describe("toApiError", () => {
  it("maps an error envelope to class, fields, meta.limit, and status", () => {
    const error = toApiError({
      ok: false,
      status: 409,
      error: {
        code: "SLOTS.LIMIT_REACHED",
        class: ApiErrorClassEnum.CONFLICT,
        message: "Slot limit reached.",
        fields: [{ name: "title", message: "Too long." }],
        meta: { limit: 3 },
      },
      correlation_id: "corr-1",
    })

    expect(error).toBeInstanceOf(ApiError)
    expect(error.class).toBe(ApiErrorClassEnum.CONFLICT)
    expect(error.fields).toEqual([{ name: "title", message: "Too long." }])
    expect(error.meta).toEqual({ limit: 3 })
    expect(error.status).toBe(409)
    expect(error.code).toBe("SLOTS.LIMIT_REACHED")
    expect(error.message).toBe("Slot limit reached.")
  })

  it("returns the ApiError Nuxt wraps as cause", () => {
    const cause = new ApiError(
      {
        code: "SLOTS.LIMIT_REACHED",
        class: ApiErrorClassEnum.CONFLICT,
        message: "Slot limit reached.",
        fields: [{ name: "title", message: "Too long." }],
        meta: { limit: 3 },
      },
      409,
      "corr-1"
    )
    const wrapped = new Error(cause.message)
    Object.assign(wrapped, { status: 409, data: undefined, cause })

    const error = toApiError(wrapped)

    expect(error).toBe(cause)
    expect(error.message).toBe("Slot limit reached.")
    expect(error.meta).toEqual({ limit: 3 })
    expect(error.fields).toEqual([{ name: "title", message: "Too long." }])
    expect(error.status).toBe(409)
    expect(error.code).toBe("SLOTS.LIMIT_REACHED")
  })

  it("uses the network fallback for a non-HTTP throw", () => {
    const error = toApiError(new TypeError("Failed to fetch"))

    expect(error.message).toBe("Network error. Try again later.")
  })

  it("uses the unexpected-response fallback for invalid JSON", () => {
    const error = toApiError(new SyntaxError("Unexpected token"))

    expect(error.message).toBe("The server returned an unexpected response. Try again later.")
  })

  it("uses the unexpected-response fallback for a body without ok: true", () => {
    let thrown: unknown
    try {
      unwrapApiResult({ id: "job-1" })
    } catch (e: unknown) {
      thrown = e
    }

    expect(toApiError(thrown).message).toBe("The server returned an unexpected response. Try again later.")
  })

  it("uses VALIDATION.FAILED when class is validation and code is missing", () => {
    const error = toApiError({
      status: 422,
      error: {
        class: ApiErrorClassEnum.VALIDATION,
        message: "Name is required.",
      },
    })

    expect(error.code).toBe("VALIDATION.FAILED")
    expect(error.class).toBe(ApiErrorClassEnum.VALIDATION)
  })

  it("uses INTERNAL.UNEXPECTED when a non-validation class omits code", () => {
    const error = toApiError({
      status: 500,
      error: {
        class: ApiErrorClassEnum.INTERNAL,
        message: "Something went wrong. Try again later.",
      },
    })

    expect(error.code).toBe("INTERNAL.UNEXPECTED")
    expect(error.class).toBe(ApiErrorClassEnum.INTERNAL)
  })

  it("derives a missing class from status and fills a missing code", () => {
    const cases = [
      [400, ApiErrorClassEnum.VALIDATION, "VALIDATION.FAILED"],
      [401, ApiErrorClassEnum.AUTH, "INTERNAL.UNEXPECTED"],
      [403, ApiErrorClassEnum.FORBIDDEN, "INTERNAL.UNEXPECTED"],
      [404, ApiErrorClassEnum.NOT_FOUND, "INTERNAL.UNEXPECTED"],
      [409, ApiErrorClassEnum.CONFLICT, "INTERNAL.UNEXPECTED"],
      [429, ApiErrorClassEnum.RATE_LIMIT, "INTERNAL.UNEXPECTED"],
      [502, ApiErrorClassEnum.UPSTREAM, "INTERNAL.UNEXPECTED"],
      [503, ApiErrorClassEnum.UPSTREAM, "INTERNAL.UNEXPECTED"],
      [500, ApiErrorClassEnum.INTERNAL, "INTERNAL.UNEXPECTED"],
    ] as const

    for (const [status, errorClass, code] of cases) {
      const error = toApiError({
        status,
        error: { message: "from server" },
      })

      expect(error.class).toBe(errorClass)
      expect(error.code).toBe(code)
      expect(error.status).toBe(status)
    }
  })
})
