<template>
  <div class="overflow-hidden rounded-lg border border-border bg-white">
    <div v-if="cardTitle" class="border-b border-border px-6 py-4">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-primary">{{ cardTitle }}</h2>
    </div>

    <div class="overflow-x-auto">
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
      class="flex flex-col items-center justify-between border-t border-border sm:flex-row"
      :class="[footerPaddingClass, footerGapClass]"
    >
      <div :class="summaryTextClass">Page {{ page }} · {{ pageSize }} per page · Total {{ total }}</div>
      <div class="flex items-center gap-2">
        <button type="button" :class="navButtonClasses(prevDisabled)" :disabled="prevDisabled" @click="emit('prev')">Previous</button>
        <button type="button" :class="navButtonClasses(nextDisabled)" :disabled="nextDisabled" @click="emit('next')">Next</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue"

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

  emits: ["prev", "next"],

  setup(props, { emit }) {
    const prevDisabled = computed(() => props.navigationDisabled || props.empty || !props.canPrev)
    const nextDisabled = computed(() => props.navigationDisabled || props.empty || !props.canNext)

    const footerPaddingClass = computed(() => (props.density === "compact" ? "px-4 py-3" : "px-6 py-4"))

    const footerGapClass = computed(() => (props.density === "compact" ? "gap-3" : "gap-4"))

    const summaryTextClass = computed(() => (props.density === "compact" ? "text-xs text-secondary" : "text-sm text-secondary"))

    function navButtonClasses(disabled: boolean) {
      const sizing = props.density === "compact" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      const base = `font-medium bg-white border border-border rounded-lg ${sizing}`
      return disabled ? `${base} text-secondary opacity-50 cursor-not-allowed` : `${base} text-primary transition-colors duration-200 hover:bg-rowHover`
    }

    return {
      prevDisabled,
      nextDisabled,
      footerPaddingClass,
      footerGapClass,
      summaryTextClass,
      navButtonClasses,
      emit,
    }
  },
})
</script>
