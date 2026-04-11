<template>
  <div>
    <div class="border-b border-border">
      <nav class="flex space-x-8" role="tablist" :aria-label="ariaLabel">
        <button
          v-for="(label, index) in resolvedTabs"
          :id="tabId(index)"
          :key="index"
          type="button"
          role="tab"
          :class="tabButtonClass(index)"
          :aria-selected="modelValue === index"
          :aria-controls="panelId(index)"
          :tabindex="modelValue === index ? 0 : -1"
          @click="select(index)"
        >
          {{ label }}
          <span v-if="modelValue === index" class="absolute bottom-0 left-0 right-0 h-0.5 bg-btnPrimary" aria-hidden="true" />
        </button>
      </nav>
    </div>

    <div :class="panelWrapperClass">
      <div v-for="(_, index) in resolvedTabs" v-show="modelValue === index" :id="panelId(index)" :key="'panel-' + index" role="tabpanel" :aria-labelledby="tabId(index)">
        <slot :name="'tab-' + index" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue"

export default defineComponent({
  name: "UnderlineTabs",

  props: {
    /** v-model: active tab index (0-based). */
    modelValue: { type: Number, default: 0 },
    /** Tab labels; if non-empty, its length is the tab count (and optional `tabCount` is ignored). */
    tabs: { type: Array as PropType<string[]>, default: () => [] },
    /** How many tabs when `tabs` is empty; labels default to `Stage 1`, `Stage 2`, … */
    tabCount: { type: Number, default: 0 },
    /** Prefix for stable `id` / `aria-*` wiring. */
    idPrefix: { type: String, default: "underline-tabs" },
    ariaLabel: { type: String, default: "Tabs" },
    panelWrapperClass: { type: String, default: "" },
  },

  emits: ["update:modelValue"],

  setup(props, { emit }) {
    const resolvedTabs = computed(() => {
      if (props.tabs.length > 0) return props.tabs
      const n = props.tabCount
      if (n > 0) {
        return Array.from({ length: n }, (_, i) => `Stage ${i + 1}`)
      }
      return []
    })
    function tabId(index: number) {
      return `${props.idPrefix}-tab-${index}`
    }

    function panelId(index: number) {
      return `${props.idPrefix}-panel-${index}`
    }

    function tabButtonClass(index: number) {
      const base = "relative pb-4 px-1 text-sm font-medium transition-colors duration-200"
      const active = props.modelValue === index
      return active ? `${base} text-btnPrimary` : `${base} text-link hover:text-linkHover`
    }

    function select(index: number) {
      if (index === props.modelValue) return
      emit("update:modelValue", index)
    }

    return {
      resolvedTabs,
      tabId,
      panelId,
      tabButtonClass,
      select,
    }
  },
})
</script>
