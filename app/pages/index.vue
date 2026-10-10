<template>
  <main id="main-content" class="flex flex-1 flex-col items-center px-4 sm:px-6 lg:px-8" :class="mainVerticalClass">
    <div v-if="isLoading" class="w-full max-w-[640px] py-12 text-sm text-secondary">Loading…</div>

    <div v-else-if="loadError" class="w-full max-w-[640px] py-12 text-sm text-destructive">{{ loadError }}</div>

    <template v-else>
      <div v-if="profilesList.length" id="profiles-container" class="w-full max-w-[640px]">
        <div id="header-section" class="mb-6">
          <h1 id="profiles-title" class="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Profiles</h1>
        </div>

        <div id="profiles-list" class="flex flex-col gap-3">
          <NuxtLink
            v-for="item in profilesList"
            :id="'profile-card-' + item.id"
            :key="item.id"
            :to="'/profiles/' + item.id"
            class="profile-card block rounded-lg border border-border bg-card-bg p-5 no-underline"
          >
            <h2 class="truncate text-base font-medium text-primary">{{ item.name }}</h2>
          </NuxtLink>
        </div>
      </div>

      <div v-else id="empty-state-container" class="flex w-full max-w-[640px] flex-col items-center text-center">
        <h1 id="empty-state-title" class="mb-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Profiles</h1>
        <p id="empty-state-helper" class="max-w-md text-base text-secondary sm:text-lg">No profiles.</p>
      </div>
    </template>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue"

import { getProfiles } from "~/api/publicApi"
import { toApiError } from "~/utils"

export default defineComponent({
  name: "IndexPage",

  setup() {
    const { data: profilesResponse, pending: isLoading, error } = useAsyncData("profiles", () => getProfiles())

    const profilesList = computed(() => profilesResponse.value?.profiles ?? [])

    const loadError = computed(() => {
      const e = error.value
      if (!e) return null
      return toApiError(e).message
    })

    const mainVerticalClass = computed(() => {
      if (isLoading.value || loadError.value) return "py-12"
      return profilesList.value.length === 0 ? "justify-center py-24" : "py-12"
    })

    return {
      profilesList,
      isLoading,
      loadError,
      mainVerticalClass,
    }
  },
})
</script>

<style scoped>
.profile-card {
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.profile-card:hover {
  border-color: #d4d4d8;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}
</style>
