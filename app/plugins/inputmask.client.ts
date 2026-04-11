import Inputmask from "inputmask"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("mask", {
    mounted(el, binding) {
      const options = typeof binding.value === "string" ? { alias: binding.value } : binding.value

      Inputmask(options).mask(el)
    },

    unmounted(el) {
      Inputmask.remove(el)
    },
  })
})
