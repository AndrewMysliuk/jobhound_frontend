<template>
  <Teleport to="body">
    <div v-if="modelValue" id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4" role="presentation" @click.self="onBackdropClick">
      <div :id="panelId" class="w-full rounded-lg border border-border bg-cardBg p-6 shadow-lg sm:p-8" :class="maxWidthClass" role="dialog" aria-modal="true" @click.stop>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, watch } from "vue"

export default defineComponent({
  name: "BaseModal",

  props: {
    modelValue: { type: Boolean, required: true },
    closeOnBackdropClick: { type: Boolean, default: true },
    maxWidthClass: { type: String, default: "max-w-[560px]" },
    panelId: { type: String, default: undefined },
  },

  emits: ["update:modelValue"],

  setup(props, { emit }) {
    let escHandler: ((e: KeyboardEvent) => void) | null = null

    watch(
      () => props.modelValue,
      (open) => {
        if (escHandler) {
          window.removeEventListener("keydown", escHandler)
          escHandler = null
        }
        if (open) {
          escHandler = (e: KeyboardEvent) => {
            if (e.key === "Escape") emit("update:modelValue", false)
          }
          window.addEventListener("keydown", escHandler)
        }
      },
      { immediate: true },
    )

    onUnmounted(() => {
      if (escHandler) window.removeEventListener("keydown", escHandler)
    })

    function onBackdropClick() {
      if (props.closeOnBackdropClick) emit("update:modelValue", false)
    }

    return { onBackdropClick }
  },
})
</script>
