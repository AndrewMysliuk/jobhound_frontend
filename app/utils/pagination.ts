import { computed, type ComputedRef, type Ref } from "vue"

export type PaginatedListPayload<T = unknown> = {
  items: T[]
  total: number
  page: number
  limit: number
}

export type PaginatedTableSlice<T = unknown> = {
  items: T[]
  total: number
  pageShown: number
  canPrev: boolean
  canNext: boolean
}

export function computedPaginatedTableSlice<T>(
  data: Ref<PaginatedListPayload<T> | null | undefined>,
  requestedPage: Ref<number>,
): ComputedRef<PaginatedTableSlice<T>> {
  return computed(() => {
    const d = data.value
    const pageShown = d?.page ?? requestedPage.value
    return {
      items: d?.items ?? [],
      total: d?.total ?? 0,
      pageShown,
      canPrev: pageShown > 1,
      canNext: d != null && d.page * d.limit < d.total,
    }
  })
}
