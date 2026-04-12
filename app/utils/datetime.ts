import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"
import { enUS } from "date-fns/locale"

export function formatIsoLocalDateTime(iso: string): string {
  const d = parseISO(iso)
  if (!isValid(d)) return iso
  return format(d, "yyyy-MM-dd HH:mm:ss")
}

export function formatIsoLocalDateTimeMinutes(iso: string): string {
  const d = parseISO(iso)
  if (!isValid(d)) return iso
  return format(d, "yyyy-MM-dd HH:mm")
}

/** e.g. prefix `"Created"` → `Created 2 hours ago` (invalid ISO → `Created <raw>`). */
export function formatIsoRelativeLabel(iso: string, labelPrefix: string): string {
  const d = parseISO(iso)
  if (!isValid(d)) return `${labelPrefix} ${iso}`
  return `${labelPrefix} ${formatDistanceToNow(d, { addSuffix: true, locale: enUS })}`
}
