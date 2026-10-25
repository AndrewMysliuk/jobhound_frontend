export type ApplyOrListingRow = {
  apply_url: string
  url?: string
}

/** Recruitee apply links use /o/{slug}/c/new; job pages use /o/{slug}. */
export function normalizeApplyUrl(raw: string): string {
  const s = (raw ?? "").trim()
  if (s === "") return s
  try {
    const u = new URL(s)
    if (!u.hostname.toLowerCase().endsWith("recruitee.com")) return s
    const cIdx = u.pathname.indexOf("/c/")
    if (cIdx >= 0 && u.pathname.startsWith("/o/")) {
      u.pathname = u.pathname.slice(0, cIdx)
    }
    u.search = ""
    u.hash = ""
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1)
    }
    return u.toString()
  } catch {
    return s
  }
}

function isRecruiteeHref(href: string): boolean {
  try {
    return new URL(href).hostname.toLowerCase().endsWith("recruitee.com")
  } catch {
    return false
  }
}

/** Company careers index from a Recruitee job/apply URL (e.g. eworgmbh.recruitee.com/). */
export function recruiteeCareersUrlFromApply(raw: string): string {
  const norm = normalizeApplyUrl(raw)
  if (norm === "") return ""
  try {
    const u = new URL(norm)
    if (!u.hostname.toLowerCase().endsWith("recruitee.com")) return ""
    return `${u.protocol}//${u.host}/`
  } catch {
    return ""
  }
}

/** Aggregator / source listing page (where the vacancy was seen). */
export function resolveListingHref(row: ApplyOrListingRow): string {
  return (row.url ?? "").trim()
}

/**
 * Direct apply when present. Recruitee deep links rot — prefer careers index.
 * Empty when there is no apply (caller should not fall back to listing).
 */
export function resolveApplyHref(row: ApplyOrListingRow): string {
  const apply = normalizeApplyUrl(row.apply_url ?? "")
  if (apply === "") return ""
  if (isRecruiteeHref(apply)) {
    const careers = recruiteeCareersUrlFromApply(apply)
    if (careers !== "") return careers
  }
  return apply
}

/**
 * Prefer apply when present; else listing.
 * Recruitee: careers (or listing) instead of a stale /o/{slug}/c/new deep link.
 */
export function resolveApplyOrListingHref(row: ApplyOrListingRow): string {
  const apply = resolveApplyHref(row)
  if (apply !== "") return apply
  return resolveListingHref(row)
}
