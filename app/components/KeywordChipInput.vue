<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-primary">{{ label }}</label>
    <div
      class="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2"
      :class="disabled ? 'cursor-not-allowed opacity-60' : ''"
    >
      <span v-for="(chip, index) in modelValue" :key="index + chip" class="inline-flex items-center gap-1.5 rounded border border-border bg-chipBg px-2.5 py-1 text-sm text-primary">
        {{ chip }}
        <button
          type="button"
          class="text-xs text-secondary transition-colors"
          :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-primary'"
          :disabled="disabled"
          :aria-label="'Remove ' + chip"
          @click="remove(index)"
        >
          ×
        </button>
      </span>
      <input
        v-model="draft"
        type="text"
        class="min-w-[5rem] flex-1 border-0 bg-transparent text-sm text-primary outline-none placeholder:text-placeholder disabled:cursor-not-allowed"
        :disabled="disabled"
        :placeholder="placeholder"
        @keydown="onKeydown"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref } from "vue"

export default defineComponent({
  name: "KeywordChipInput",

  props: {
    modelValue: { type: Array as PropType<string[]>, required: true },
    label: { type: String, required: true },
    placeholder: { type: String, default: "Type and press space…" },
    disabled: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  setup(props, { emit }) {
    const draft = ref("")

    function commitChips(next: string[]) {
      emit("update:modelValue", next)
    }

    function addChipFromDraft() {
      if (props.disabled) return
      const t = draft.value.trim()
      if (!t) return
      if (props.modelValue.includes(t)) {
        draft.value = ""
        return
      }
      commitChips([...props.modelValue, t])
      draft.value = ""
    }

    function remove(index: number) {
      if (props.disabled) return
      const next = props.modelValue.filter((_, i) => i !== index)
      commitChips(next)
    }

    function onKeydown(e: KeyboardEvent) {
      if (props.disabled) return
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        addChipFromDraft()
        return
      }
      if (e.key === "Backspace" && draft.value === "" && props.modelValue.length > 0) {
        e.preventDefault()
        remove(props.modelValue.length - 1)
      }
    }

    return {
      draft,
      remove,
      onKeydown,
    }
  },
})
</script>
