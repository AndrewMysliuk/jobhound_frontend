import type { IStage2Rule } from "~/types"

import { DEFAULT_STAGE2_EXCLUDE } from "./defaultStage2Exclude"

/** Upper bound for `max_jobs` in stage 3 run request (`stage3_run.schema.json`). */
export const STAGE3_MAX_JOBS_CAP = 100

export { DEFAULT_STAGE2_EXCLUDE }

function stringArrayFromUnknown(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const out: string[] = []
  for (const x of v) {
    if (typeof x !== "string") return null
    out.push(x)
  }
  return out
}

function cleanPhrases(lines: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of lines) {
    const t = line.trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

/**
 * Reject a listing whose stated hiring countries miss Europe-ok.
 * A US tag is allowed: US-only is a visa or "must be located" line in exclude, not the country.
 * `when: "explicit"` keeps listings that state no region at all.
 */
const GEO_RULE: IStage2Rule = {
  id: "geo",
  field: "countries_allowed",
  op: "excludes",
  values: ["EUROPE_HIRING_OK", "US"],
  action: "reject",
  when: "explicit",
}

/**
 * Exclude lines become one listing phrase reject. Include lines become one listing phrase boost.
 * Both search title, company, description, tags, hiring raw, and salary.
 */
export function stage2RulesFromKeywords(include: string[], exclude: string[]): IStage2Rule[] {
  const rules: IStage2Rule[] = [GEO_RULE]
  const excluded = cleanPhrases(exclude)
  const included = cleanPhrases(include)
  if (excluded.length > 0) {
    rules.push({
      id: "exclude",
      field: "listing",
      op: "phrase",
      values: excluded,
      action: "reject",
    })
  }
  if (included.length > 0) {
    rules.push({
      id: "include",
      field: "listing",
      op: "phrase",
      values: included,
      action: "boost",
      weight: 1,
    })
  }
  return rules
}

export function stage2KeywordsFromPayload(payload: Record<string, unknown> | null): { include: string[]; exclude: string[] } | null {
  if (payload == null) return null
  if (Array.isArray(payload.rules)) {
    const include: string[] = []
    const exclude: string[] = []
    for (const rule of payload.rules) {
      if (rule == null || typeof rule !== "object") return null
      const rec = rule as Record<string, unknown>
      const values = stringArrayFromUnknown(rec.values)
      if (values == null) return null
      // Only phrase rules come from the keyword textareas; the geo rule is not user-editable text.
      if (rec.op !== "phrase") continue
      if (rec.action === "reject") exclude.push(...values)
      else if (rec.action === "boost") include.push(...values)
    }
    return { include, exclude }
  }
  const include = payload.include == null ? [] : stringArrayFromUnknown(payload.include)
  const exclude = payload.exclude == null ? [] : stringArrayFromUnknown(payload.exclude)
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
