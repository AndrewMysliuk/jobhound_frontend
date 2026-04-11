<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <section class="text-center max-w-md">
      <h1 class="text-7xl font-bold text-gray-800 tracking-tight">
        {{ title }}
      </h1>

      <p class="mt-4 text-lg text-gray-600">
        {{ description }}
      </p>

      <nuxt-link to="/" class="mt-8 inline-block px-6 py-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition"> Go back home </nuxt-link>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  components: {},

  props: {
    error: {
      type: Object as () => { statusCode?: number; message?: string },
      required: true,
    },
  },

  setup(props) {
    const title = computed(() => (props.error?.statusCode === 404 ? "404" : (props.error?.statusCode ?? "Error")))
    const description = computed(() => (props.error?.statusCode === 404 ? "This page could not be found." : (props.error?.message ?? "Something went wrong.")))

    return {
      title,
      description,
    }
  },
})
</script>
