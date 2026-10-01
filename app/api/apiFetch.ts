const CORRELATION_ID_HEADER = "X-Correlation-ID"

function withCorrelationIdHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers)

  if (!result.has(CORRELATION_ID_HEADER)) {
    result.set(CORRELATION_ID_HEADER, crypto.randomUUID())
  }

  return result
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: withCorrelationIdHeaders(init?.headers),
  })
}
