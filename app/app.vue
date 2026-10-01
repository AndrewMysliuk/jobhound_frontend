<template>
  <div class="flex min-h-screen flex-col bg-page">
    <TheHeader />
    <NuxtPage />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import { TheHeader } from "./components"

import "vue-sonner/style.css"

export default defineComponent({
  components: {
    TheHeader,
  },
})
</script>
