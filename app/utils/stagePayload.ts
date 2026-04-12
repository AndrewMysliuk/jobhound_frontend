/** Upper bound for `max_jobs` in stage 3 run request (`stage3_run.schema.json`). */
export const STAGE3_MAX_JOBS_CAP = 100

function stringArrayFromUnknown(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const out: string[] = []
  for (const x of v) {
    if (typeof x !== "string") return null
    out.push(x)
  }
  return out
}

export function stage2KeywordsFromPayload(payload: Record<string, unknown> | null): { include: string[]; exclude: string[] } | null {
  if (payload == null) return null
  const include = stringArrayFromUnknown(payload.include)
  const exclude = stringArrayFromUnknown(payload.exclude)
  if (include == null || exclude == null) return null
  return { include: [...include], exclude: [...exclude] }
}

export function stage2PayloadSignature(payload: Record<string, unknown> | null): string {
  const kw = stage2KeywordsFromPayload(payload)
  if (!kw) return "null"
  return JSON.stringify({ include: kw.include, exclude: kw.exclude })
}

export function maxJobsFromStage3Payload(payload: Record<string, unknown> | null): number | null {
  if (payload == null) return null
  const v = payload.max_jobs
  if (typeof v !== "number" || !Number.isFinite(v)) return null
  const t = Math.trunc(v)
  if (t < 1 || t > STAGE3_MAX_JOBS_CAP) return null
  return t
}

export function stage3PayloadSignature(payload: Record<string, unknown> | null): string {
  const n = maxJobsFromStage3Payload(payload)
  return n == null ? "null" : String(n)
}
