import { ApiError } from "~/types"
import { toApiError, unwrapApiResult } from "~/utils"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isJsonContentType(contentType: string | null): boolean {
  return contentType != null && (contentType.includes("application/json") || contentType.includes("+json"))
}

function isErrorEnvelope(body: unknown): body is Record<string, unknown> {
  return isRecord(body) && isRecord(body.error) && typeof body.error.code === "string"
}

export async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return

  let data: unknown = {}
  try {
    data = await res.json()
  } catch {
    data = ""
  }

  throw toApiError({
    status: res.status,
    data,
    headers: res.headers,
  })
}

export async function readApiJson<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T
  }

  const contentType = res.headers.get("content-type")
  if (contentType != null && contentType !== "" && !isJsonContentType(contentType)) {
    await throwIfNotOk(res)
    return undefined as T
  }

  let body: unknown
  try {
    const text = await res.text()
    if (text === "") {
      if (!res.ok) {
        throw toApiError({ status: res.status, headers: res.headers })
      }
      return undefined as T
    }
    body = JSON.parse(text) as unknown
  } catch (e: unknown) {
    if (e instanceof ApiError) throw e
    throw toApiError({ status: res.status, data: "", headers: res.headers })
  }

  if (!res.ok) {
    if (isErrorEnvelope(body)) {
      throw toApiError({ ...body, status: res.status })
    }
    throw toApiError({ status: res.status, data: body, headers: res.headers })
  }

  if (isRecord(body) && body.ok === true && "result" in body) {
    return unwrapApiResult<T>(body)
  }

  return body as T
}
