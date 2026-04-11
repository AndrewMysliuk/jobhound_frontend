import { ApiError, isAPIErrorBody, isSlotLimitReachedBody } from "~/types"

const API_V1_PREFIX = "/api/v1"

async function readResponseBodyUnknown(res: Response): Promise<unknown> {
  const raw = await res.text()
  if (!raw.length) return undefined
  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new ApiError("INVALID_JSON", "Response body is not valid JSON.")
  }
}

/**
 * JSON request to the product API (`cmd/api` → `/api/v1/...`).
 * Uses `runtimeConfig.public.apiBaseUrl` (host only, no trailing path).
 */
export async function publicApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = useRuntimeConfig()
  const base = String(config.public.apiBaseUrl).replace(/\/$/, "")
  const url = `${base}${API_V1_PREFIX}${path.startsWith("/") ? path : `/${path}`}`

  try {
    const res = await fetch(url, init)
    const body = await readResponseBodyUnknown(res)

    if (!res.ok) {
      if (res.status === 409 && isSlotLimitReachedBody(body)) {
        throw ApiError.fromSlotLimitReached(body)
      }
      if (isAPIErrorBody(body)) {
        throw ApiError.fromAPIErrorBody(body)
      }
      throw new ApiError("UNKNOWN_BACKEND_ERROR", `Server error. HTTP status: ${res.status}`)
    }

    return body as T
  } catch (e: unknown) {
    if (e instanceof ApiError) {
      throw e
    }
    throw new ApiError("NETWORK_ERROR", "Network error.", { cause: e })
  }
}
