import { describe, expect, it } from "vitest"

import { unwrapApiResult } from "~/utils/unwrapApiResult"

describe("unwrapApiResult", () => {
  it("returns result from a success envelope", () => {
    expect(unwrapApiResult({ ok: true, result: { id: "job-1" }, correlation_id: "corr-1" })).toEqual({ id: "job-1" })
  })

  it("throws when ok is false", () => {
    expect(() => unwrapApiResult({ ok: false, error: { code: "VALIDATION.FAILED", class: "validation", message: "The request is invalid." } })).toThrow("Expected API success envelope")
  })

  it("throws for a bare DTO", () => {
    expect(() => unwrapApiResult({ id: "job-1" })).toThrow("Expected API success envelope")
  })
})
