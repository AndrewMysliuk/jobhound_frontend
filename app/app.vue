<template>
  <div class="flex min-h-screen flex-col bg-page">
    <TheHeader />
    <NuxtPage />
  </div>
</template>

<script lang="ts">
import "vue-sonner/style.css"
import { defineComponent } from "vue"
import { TheHeader } from "./components"

export default defineComponent({
  components: {
    TheHeader,
  },
})
</script>
