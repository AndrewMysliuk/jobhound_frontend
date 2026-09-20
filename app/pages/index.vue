<template>
  <main id="main-content" class="flex flex-1 flex-col items-center px-4 sm:px-6 lg:px-8" :class="mainVerticalClass">
    <div v-if="isLoading" class="w-full max-w-[640px] py-12 text-sm text-secondary">Loading…</div>

    <div v-else-if="loadError" class="w-full max-w-[640px] py-12 text-sm text-destructive">{{ loadError }}</div>

    <template v-else>
      <!-- List layout (template.html searches view) -->
      <div v-if="slotsList.length" id="searches-container" class="w-full max-w-[640px]">
        <p v-if="createError" class="mb-4 text-sm text-destructive">{{ createError }}</p>
        <p v-if="deleteError" class="mb-4 text-sm text-destructive">{{ deleteError }}</p>

        <div id="header-section" class="mb-2 flex items-center justify-between">
          <h1 id="searches-title" class="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Your searches</h1>
          <button
            id="new-search-btn"
            type="button"
            class="rounded-lg bg-btnPrimary py-2 px-5 text-sm font-medium text-btnText shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-btnPrimary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="slotsList.length >= 3 || isCreating"
            @click="onCreateSearch"
          >
            {{ isCreating ? "Creating…" : "New search" }}
          </button>
        </div>

        <p id="helper-text" class="mb-6 text-sm text-secondary">Up to 3 active searches.</p>

        <div id="slots-list" class="flex flex-col gap-3">
          <div v-for="item in slotsList" :id="'slot-card-' + item.id" :key="item.id" class="slot-card flex items-start justify-between rounded-lg border border-border bg-cardBg p-5">
            <NuxtLink :to="{ path: '/slots-details', query: { slot: item.id } }" class="min-w-0 flex-grow no-underline">
              <h2 class="mb-1 truncate text-base font-medium text-primary">{{ item.name }}</h2>
              <p class="text-sm text-secondary">{{ formatIsoRelativeLabel(item.created_at, "Created") }}</p>
            </NuxtLink>
            <button
              type="button"
              class="ml-4 flex-shrink-0 text-sm font-medium text-destructive hover:underline focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="deletingId === item.id"
              @click.stop="onDeleteSlot(item.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else id="empty-state-container" class="flex w-full max-w-[640px] flex-col items-center text-center">
        <h1 id="empty-state-title" class="mb-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Your searches</h1>

        <p id="empty-state-helper" class="mb-8 max-w-md text-base text-secondary sm:text-lg">You can have up to 3 active searches.</p>

        <p v-if="createError" class="mb-4 text-sm text-destructive">{{ createError }}</p>

        <button
          id="new-search-btn"
          type="button"
          class="rounded-lg bg-btnPrimary py-2.5 px-6 font-medium text-btnText shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-btnPrimary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="slotsList.length >= 3 || isCreating"
          @click="onCreateSearch"
        >
          {{ isCreating ? "Creating…" : "New search" }}
        </button>
      </div>
    </template>
  </main>
</template>

<script lang="ts">
import { v4 as uuidv4 } from "uuid"
import { computed, defineComponent, ref } from "vue"

import { deleteSlot, getSlots, postSlots } from "~/api/publicApi"
import { formatIsoRelativeLabel } from "~/utils"
import { ApiError } from "~/types"

function nextSearchName(existing: { name: string }[]): string {
  const used = new Set(existing.map((s) => s.name))
  for (let i = 1; i <= existing.length + 1; i++) {
    const name = `Search ${i}`
    if (!used.has(name)) return name
  }
  return `Search ${existing.length + 1}`
}

export default defineComponent({
  name: "IndexPage",

  setup() {
    const { data: slotsResponse, pending: isLoading, error, refresh } = useAsyncData("slots", () => getSlots())

    const slotsList = computed(() => slotsResponse.value?.slots ?? [])

    const loadError = computed(() => {
      const e = error.value
      if (!e) return null
      return e instanceof Error ? e.message : String(e)
    })

    const mainVerticalClass = computed(() => {
      if (isLoading.value || loadError.value) return "py-12"
      return slotsList.value.length === 0 ? "justify-center py-24" : "py-12"
    })

    const isCreating = ref(false)
    const createError = ref<string | null>(null)
    const deletingId = ref<string | null>(null)
    const deleteError = ref<string | null>(null)

    async function onCreateSearch() {
      if (slotsList.value.length >= 3 || isCreating.value) return
      createError.value = null
      isCreating.value = true
      try {
        const created = await postSlots(nextSearchName(slotsList.value), uuidv4())
        await refresh()
        await navigateTo({ path: "/slots-details", query: { slot: created.id } })
      } catch (e) {
        createError.value = e instanceof ApiError ? e.message : "Failed to create search"
      } finally {
        isCreating.value = false
      }
    }

    async function onDeleteSlot(id: string) {
      deleteError.value = null
      deletingId.value = id
      try {
        await deleteSlot(id)
        await refresh()
      } catch (e) {
        deleteError.value = e instanceof ApiError ? e.message : "Failed to delete search"
      } finally {
        deletingId.value = null
      }
    }

    return {
      slotsList,
      isLoading,
      loadError,
      mainVerticalClass,
      isCreating,
      createError,
      deletingId,
      deleteError,
      onCreateSearch,
      onDeleteSlot,
      formatIsoRelativeLabel,
    }
  },
})
</script>

<style scoped>
.slot-card {
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.slot-card:hover {
  border-color: #d4d4d8;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}
</style>
