<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-primary">{{ label }}</label>
    <textarea
      v-model="localText"
      class="min-h-[12rem] w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="disabled"
      :placeholder="placeholder"
      spellcheck="false"
      @input="onInput"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch } from "vue"

function linesFromText(text: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of text.split("\n")) {
    const t = line.trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

function textFromLines(lines: string[]): string {
  return lines.join("\n")
}

export default defineComponent({
  name: "KeywordLineTextarea",

  props: {
    modelValue: { type: Array as PropType<string[]>, required: true },
    label: { type: String, required: true },
    placeholder: { type: String, default: "One phrase per line…" },
    disabled: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  setup(props, { emit }) {
    const localText = ref(textFromLines(props.modelValue))

    watch(
      () => props.modelValue,
      (v) => {
        if (linesFromText(localText.value).join("\x00") === v.join("\x00")) return
        localText.value = textFromLines(v)
      },
      { deep: true },
    )

    function onInput() {
      if (props.disabled) return
      emit("update:modelValue", linesFromText(localText.value))
    }

    return {
      localText,
      onInput,
    }
  },
})
</script>
