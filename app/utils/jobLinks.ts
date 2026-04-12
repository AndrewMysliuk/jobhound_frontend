export type ApplyOrListingRow = {
  apply_url: string
  url?: string
}

/** Prefer direct apply URL; fall back to listing URL. */
export function resolveApplyOrListingHref(row: ApplyOrListingRow): string {
  const apply = (row.apply_url ?? "").trim()
  if (apply !== "") return apply
  const listing = (row.url ?? "").trim()
  return listing !== "" ? listing : ""
}
