import type { IApiSuccessEnvelopeType } from "~/types"

function isSuccessEnvelope<T>(data: unknown): data is IApiSuccessEnvelopeType<T> {
  return typeof data === "object" && data !== null && "ok" in data && data.ok === true && "result" in data
}

export function unwrapApiResult<T>(data: unknown): T {
  if (!isSuccessEnvelope<T>(data)) {
    throw new Error("Expected API success envelope")
  }

  return data.result
}
