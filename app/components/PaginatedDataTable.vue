<template>
  <div ref="tableRoot" class="scroll-mt-4 overflow-hidden rounded-lg border border-border bg-white">
    <div v-if="cardTitle" class="border-b border-border px-6 py-4">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-primary">{{ cardTitle }}</h2>
    </div>

    <template v-for="placement in pagerPlacements" :key="placement">
      <div v-if="placement === 'bottom'" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <slot name="thead" />
          </thead>
          <tbody v-if="!empty" class="divide-y divide-border">
            <slot name="tbody" />
          </tbody>
        </table>

        <div v-if="empty" class="flex items-center justify-center py-24">
          <p class="text-sm text-secondary">{{ emptyMessage }}</p>
        </div>
      </div>

      <div
        v-if="showPagination"
        class="flex flex-col items-center justify-between border-border sm:flex-row"
        :class="[footerPaddingClass, footerGapClass, placement === 'top' ? 'border-b' : 'border-t']"
      >
        <div :class="summaryTextClass">{{ recordRangeLabel }}</div>
        <nav class="flex flex-wrap items-center justify-center gap-1" :aria-label="placement === 'top' ? 'Pagination, top' : 'Pagination, bottom'">
          <button type="button" :class="navButtonClasses(prevDisabled)" :disabled="prevDisabled" @click="onPrev">Previous</button>
          <template v-for="(token, index) in pageTokens" :key="pageTokenKey(token, index)">
            <span v-if="token === 'ellipsis'" class="px-1 text-secondary" aria-hidden="true">…</span>
            <button v-else type="button" :class="pageButtonClasses(token)" :disabled="pageButtonDisabled(token)" :aria-current="token === page ? 'page' : undefined" @click="onGoto(token)">
              {{ token }}
            </button>
          </template>
          <button type="button" :class="navButtonClasses(nextDisabled)" :disabled="nextDisabled" @click="onNext">Next</button>
        </nav>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType, ref } from "vue"

export default defineComponent({
  name: "PaginatedDataTable",

  props: {
    page: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    total: { type: Number, required: true },
    empty: { type: Boolean, default: false },
    canPrev: { type: Boolean, default: false },
    canNext: { type: Boolean, default: false },
    emptyMessage: { type: String, default: "No rows" },
    density: {
      type: String as PropType<"comfortable" | "compact">,
      default: "comfortable",
    },
    /** Optional heading row above the table (e.g. PASSED_STAGE_2). */
    cardTitle: { type: String, default: "" },
    showPagination: { type: Boolean, default: true },
    /** When true, prev/next stay disabled (e.g. while another pipeline stage runs). */
    navigationDisabled: { type: Boolean, default: false },
  },

  emits: ["prev", "next", "goto"],

  setup(props, { emit }) {
    type PageToken = number | "ellipsis"

    const prevDisabled = computed(() => props.navigationDisabled || props.empty || !props.canPrev)
    const nextDisabled = computed(() => props.navigationDisabled || props.empty || !props.canNext)

    const tableRoot = ref<HTMLElement | null>(null)
    const pagerPlacements = ["top", "bottom"] as const

    const footerPaddingClass = computed(() => (props.density === "compact" ? "px-4 py-3" : "px-6 py-4"))

    const footerGapClass = computed(() => (props.density === "compact" ? "gap-3" : "gap-4"))

    const summaryTextClass = computed(() => (props.density === "compact" ? "text-xs text-secondary" : "text-sm text-secondary"))

    const pageCount = computed(() => {
      if (props.pageSize <= 0 || props.total <= 0) return 0
      return Math.ceil(props.total / props.pageSize)
    })

    const recordRangeLabel = computed(() => {
      if (props.total <= 0) return "0 of 0"
      const start = Math.min((props.page - 1) * props.pageSize + 1, props.total)
      const end = Math.min(props.page * props.pageSize, props.total)
      return `${start}–${end} of ${props.total}`
    })

    const pageTokens = computed((): PageToken[] => {
      const count = pageCount.value
      const current = props.page
      if (count <= 0) return []
      if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)

      let start = Math.max(2, current - 1)
      let end = Math.min(count - 1, current + 1)
      if (current <= 3) {
        start = 2
        end = 5
      } else if (current >= count - 2) {
        start = count - 4
        end = count - 1
      }

      const tokens: PageToken[] = [1]
      if (start > 2) tokens.push("ellipsis")
      for (let pageNumber = start; pageNumber <= end; pageNumber++) tokens.push(pageNumber)
      if (end < count - 1) tokens.push("ellipsis")
      tokens.push(count)
      return tokens
    })

    function navButtonClasses(disabled: boolean) {
      const sizing = props.density === "compact" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      const base = `font-medium bg-white border border-border rounded-lg ${sizing}`
      return disabled ? `${base} text-secondary opacity-50 cursor-not-allowed` : `${base} text-primary transition-colors duration-200 hover:bg-row-hover`
    }

    function pageButtonClasses(pageNumber: number) {
      const sizing = props.density === "compact" ? "min-w-8 px-2 py-1.5 text-xs" : "min-w-9 px-3 py-2 text-sm"
      const base = `font-medium border rounded-lg tabular-nums ${sizing}`
      if (pageNumber === props.page) return `${base} border-btn-primary bg-btn-primary text-btn-text`
      if (props.navigationDisabled || props.empty) return `${base} cursor-not-allowed border-border bg-white text-secondary opacity-50`
      return `${base} border-border bg-white text-primary transition-colors duration-200 hover:bg-row-hover`
    }

    function pageButtonDisabled(pageNumber: number) {
      return props.navigationDisabled || props.empty || pageNumber === props.page || pageNumber > pageCount.value
    }

    function pageTokenKey(token: PageToken, index: number) {
      return token === "ellipsis" ? `ellipsis-${index}` : String(token)
    }

    function scrollToTableStart() {
      const root = tableRoot.value
      if (!root || root.getBoundingClientRect().top >= 0) return
      root.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    function onPrev() {
      if (prevDisabled.value) return
      emit("prev")
      scrollToTableStart()
    }

    function onNext() {
      if (nextDisabled.value) return
      emit("next")
      scrollToTableStart()
    }

    function onGoto(pageNumber: number) {
      if (pageButtonDisabled(pageNumber)) return
      emit("goto", pageNumber)
      scrollToTableStart()
    }

    return {
      tableRoot,
      pagerPlacements,
      prevDisabled,
      nextDisabled,
      footerPaddingClass,
      footerGapClass,
      summaryTextClass,
      recordRangeLabel,
      pageTokens,
      navButtonClasses,
      pageButtonClasses,
      pageButtonDisabled,
      pageTokenKey,
      onPrev,
      onNext,
      onGoto,
    }
  },
})
</script>
