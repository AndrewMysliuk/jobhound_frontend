<template>
  <header id="header" class="flex h-16 w-full items-center justify-between border-b border-border bg-headerBg px-6 lg:px-8">
    <div class="flex items-center">
      <NuxtLink to="/" class="text-xl font-semibold tracking-tight text-primary">JobHound</NuxtLink>
    </div>
    <nav class="flex items-center">
      <NuxtLink v-if="showProfileLink" to="/profile" class="text-sm font-medium text-link transition-colors duration-200 hover:text-linkHover"> Profile </NuxtLink>
      <NuxtLink v-else to="/" class="text-sm font-medium text-link transition-colors duration-200 hover:text-linkHover"> Searches </NuxtLink>
    </nav>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue"

export default defineComponent({
  name: "TheHeader",

  setup() {
    const route = useRoute()
    const showProfileLink = computed(() => route.name !== "profile")
    return { showProfileLink }
  },
})
</script>
