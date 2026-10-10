<template>
  <header id="header" class="flex h-16 w-full items-center border-b border-border bg-header-bg px-6 lg:px-8">
    <NuxtLink to="/" class="text-xl font-semibold tracking-tight text-primary">JobHound</NuxtLink>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "TheHeader",
})
</script>
