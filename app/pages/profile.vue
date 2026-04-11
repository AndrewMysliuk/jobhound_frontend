<template>
  <main id="main-content" class="flex flex-grow flex-col items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
    <div id="profile-container" class="w-full max-w-[720px]">
      <h1 id="page-title" class="mb-8 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Profile</h1>

      <div id="profile-card" class="rounded-lg border border-border bg-cardBg p-6 sm:p-8">
        <div id="profile-content" class="mb-6">
          <div v-if="isLoading" class="text-sm text-secondary">Loading…</div>
          <div v-else-if="loadError" class="text-sm text-destructive">{{ loadError }}</div>
          <div v-else-if="profileLines.length" class="space-y-4 text-base leading-relaxed text-primary">
            <p v-for="(line, i) in profileLines" :key="i">{{ line }}</p>
          </div>
          <p v-else class="text-sm text-secondary">No profile text yet. Use Edit profile to add your summary.</p>
        </div>

        <div id="profile-metadata" class="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm text-secondary">
            <template v-if="profile?.updated_at">
              Last updated <span class="font-mono">{{ profile.updated_at }}</span>
            </template>
            <template v-else-if="!isLoading && !loadError">Not saved yet</template>
          </div>

          <button
            id="edit-profile-btn"
            type="button"
            class="self-start rounded-lg bg-btnPrimary py-2.5 px-6 font-medium text-btnText shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-btnPrimary focus:ring-offset-2 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            :disabled="isLoading"
            @click="openEditModal"
          >
            Edit profile
          </button>
        </div>
      </div>
    </div>

    <BaseModal v-model="isEditModalOpen" panel-id="edit-profile-modal">
      <h2 id="modal-title" class="mb-2 text-xl font-semibold tracking-tight text-primary sm:text-2xl">Edit profile</h2>

      <p id="modal-helper" class="mb-6 text-sm text-secondary">Paste or edit your profile</p>

      <div v-if="saveError" class="mb-4 text-sm text-destructive">{{ saveError }}</div>

      <div id="textarea-container" class="mb-6">
        <textarea
          id="profile-textarea"
          v-model="profileDraft"
          class="min-h-[220px] w-full resize-y rounded-lg border border-border bg-cardBg p-4 text-base leading-relaxed text-primary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-btnPrimary"
          :placeholder="profileTextareaPlaceholder"
          :disabled="isSaving"
        />
      </div>

      <div id="modal-footer" class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          id="cancel-btn"
          type="button"
          class="w-full rounded-lg border border-border py-2.5 px-6 font-medium text-link transition-colors duration-200 hover:bg-page hover:text-linkHover focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          :disabled="isSaving"
          @click="isEditModalOpen = false"
        >
          Cancel
        </button>

        <button
          id="save-btn"
          type="button"
          class="w-full rounded-lg bg-btnPrimary py-2.5 px-6 font-medium text-btnText shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-btnPrimary focus:ring-offset-2 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          :disabled="isSaving"
          @click="onSaveProfile"
        >
          {{ isSaving ? "Saving…" : "Save" }}
        </button>
      </div>
    </BaseModal>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue"

import { getProfile, putProfile } from "~/api/publicApi"
import { ApiError } from "~/types"

import { BaseModal } from "../components"

const profileTextareaPlaceholder = `• 5+ years of experience in full-stack development with expertise in React, Node.js, and Python
• Strong background in building scalable web applications and RESTful APIs
• Passionate about clean code, test-driven development, and continuous integration practices
• Seeking remote opportunities in product-focused companies with strong engineering culture`

export default defineComponent({
  name: "ProfilePage",

  components: {
    BaseModal,
  },

  setup() {
    const { data: profile, pending: isLoading, error } = useAsyncData("profile", () => getProfile())

    const loadError = computed(() => {
      const e = error.value
      if (!e) return null
      return e instanceof Error ? e.message : String(e)
    })

    const profileLines = computed(() => {
      const text = profile.value?.text
      if (text == null || text.trim() === "") return []
      return text
        .split("\n")
        .map((l) => l.trimEnd())
        .filter((l) => l.length > 0)
    })

    const isEditModalOpen = ref(false)
    const profileDraft = ref("")
    const isSaving = ref(false)
    const saveError = ref<string | null>(null)

    function openEditModal() {
      saveError.value = null
      profileDraft.value = profile.value?.text ?? ""
      isEditModalOpen.value = true
    }

    async function onSaveProfile() {
      saveError.value = null
      isSaving.value = true
      try {
        const updated = await putProfile({ text: profileDraft.value })
        profile.value = updated
        isEditModalOpen.value = false
      } catch (e) {
        saveError.value = e instanceof ApiError ? e.message : "Failed to save profile"
      } finally {
        isSaving.value = false
      }
    }

    return {
      profile,
      isLoading,
      loadError,
      profileLines,
      profileTextareaPlaceholder,
      isEditModalOpen,
      profileDraft,
      isSaving,
      saveError,
      openEditModal,
      onSaveProfile,
    }
  },
})
</script>
