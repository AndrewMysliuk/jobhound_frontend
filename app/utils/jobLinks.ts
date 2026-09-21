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

/**
 * Prefer direct apply when it is not a stale-prone Recruitee deep link.
 * Recruitee offer slugs rot; listing (aggregator) or careers index is more reliable for old rows.
 */
export function resolveApplyOrListingHref(row: ApplyOrListingRow): string {
  const listing = (row.url ?? "").trim()
  const apply = normalizeApplyUrl(row.apply_url ?? "")

  if (apply !== "" && isRecruiteeHref(apply)) {
    if (listing !== "") return listing
    const careers = recruiteeCareersUrlFromApply(apply)
    if (careers !== "") return careers
  }

  if (apply !== "") return apply
  return listing
}
