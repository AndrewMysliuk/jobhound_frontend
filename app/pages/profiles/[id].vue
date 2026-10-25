<template>
  <main id="main-content" class="flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-[1280px]">
      <NuxtLink to="/" class="text-sm font-medium text-link transition-colors duration-200 hover:text-link-hover">← Profiles</NuxtLink>

      <div v-if="!profileId" class="mt-8 rounded-card border border-border bg-card-bg p-8 shadow-sm">
        <h1 class="text-2xl font-semibold text-primary">Profile</h1>
        <p class="mt-2 text-secondary">Open a profile from the list.</p>
      </div>

      <div v-else-if="isLoading" class="mt-8 text-sm text-secondary">Loading…</div>

      <div v-else class="mt-6">
        <div class="mb-8">
          <h1 class="text-3xl font-semibold tracking-tight text-primary lg:text-4xl">{{ profileId }}</h1>

          <p v-if="latestErrorMessage" class="mt-4 text-sm text-destructive">{{ latestErrorMessage }}</p>
          <p v-if="actionError" class="mt-4 text-sm text-destructive">{{ actionError }}</p>

          <div class="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              class="rounded-lg bg-btn-primary px-6 py-2.5 text-sm font-medium text-btn-text transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="runDisabled"
              @click="onRun"
            >
              {{ runLabel }}
            </button>

            <div v-if="latestRun" class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary">
              <span>Status {{ latestRun.status }}</span>
              <span v-if="latestRun.jobs_scored != null">Parsed {{ latestRun.jobs_scored }} vacancies</span>
              <span v-if="latestRun.sources_skipped != null">Skipped {{ latestRun.sources_skipped }} sources</span>
            </div>
            <p v-else-if="!latestErrorMessage" class="text-sm text-secondary">No run yet</p>
          </div>
        </div>

        <div class="mb-4 flex flex-wrap gap-2">
          <button type="button" :class="listButtonClass('TOP')" @click="selectList('TOP')">Top</button>
          <button type="button" :class="listButtonClass('REVIEW')" @click="selectList('REVIEW')">Review</button>
          <button type="button" :class="listButtonClass('REJECTED')" @click="selectList('REJECTED')">Rejected</button>
          <button type="button" :class="listButtonClass('hidden')" @click="selectList('hidden')">Hidden</button>
        </div>

        <p v-if="jobsErrorMessage && jobsErrorMessage !== latestErrorMessage" class="mb-3 text-sm text-destructive">{{ jobsErrorMessage }}</p>

        <PaginatedDataTable
          density="compact"
          :page="table.pageShown"
          :page-size="pageSize"
          :total="table.total"
          :empty="!jobsPending && table.items.length === 0 && !jobsErrorMessage"
          :can-prev="table.canPrev"
          :can-next="table.canNext"
          :navigation-disabled="jobsPending || patchingJobId != null"
          @prev="onPrev"
          @next="onNext"
          @goto="onGoto"
        >
          <template #thead>
            <tr class="border-b border-border bg-table-header-bg">
              <th class="w-12 px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary">#</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Title</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Company</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Score</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Sources</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Location</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">First seen</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Posted</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </template>
          <template #tbody>
            <tr v-for="(row, index) in table.items" :key="row.job_id" class="align-top">
              <td class="px-3 py-3 text-right text-sm tabular-nums text-secondary">{{ rowNumber(index) }}</td>
              <td class="px-4 py-3 text-sm font-medium text-primary">{{ row.title }}</td>
              <td class="px-4 py-3 text-sm text-primary">{{ row.company }}</td>
              <td class="px-4 py-3 text-sm text-primary">{{ row.score }}</td>
              <td class="px-4 py-3 text-sm">
                <span v-if="sourceLinks(row).length === 0" class="text-secondary">—</span>
                <div v-else class="flex flex-col divide-y divide-border">
                  <template v-for="link in sourceLinks(row)" :key="link.key">
                    <a v-if="link.href" :href="link.href" target="_blank" rel="noopener noreferrer" class="py-1.5 first:pt-0 last:pb-0" :class="linkActionClass">{{ link.label }}</a>
                    <span v-else class="py-1.5 first:pt-0 last:pb-0 text-primary">{{ link.label }}</span>
                  </template>
                </div>
              </td>
              <td class="px-4 py-3 text-sm">
                <span v-if="locationLinks(row).length === 0 && !hasKnownLocation(row.location)" class="text-secondary">—</span>
                <div v-else-if="locationLinks(row).length > 0" class="flex flex-col divide-y divide-border">
                  <a v-for="link in locationLinks(row)" :key="link.key" :href="link.href" target="_blank" rel="noopener noreferrer" class="py-1.5 first:pt-0 last:pb-0" :class="linkActionClass">
                    {{ link.label }}
                  </a>
                </div>
                <span v-else class="text-primary">{{ formatLocation(row.location) }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-primary">{{ formatIsoLocalDateTimeMinutes(row.first_seen_at) }}</td>
              <td class="px-4 py-3 text-sm" :class="postedCellClass(row.posted_at)">{{ formatPosted(row.posted_at) }}</td>
              <td class="px-4 py-3 text-sm">
                <button v-if="listView === 'hidden'" type="button" :class="jobActionClass" :disabled="patchingJobId != null" @click="onSetStatus(row.job_id, 'NEW')">Unhide</button>
                <button v-else type="button" :class="jobActionClass" :disabled="patchingJobId != null" @click="onSetStatus(row.job_id, 'HIDDEN')">Hide</button>
              </td>
            </tr>
          </template>
        </PaginatedDataTable>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, watch } from "vue"

import { getLatestProfileRun, getProfileJobs, patchProfileJob, postProfileRun } from "~/api/publicApi"
import { API_ERROR_CODES, type IGetProfileJobsQuery, type IProfileJob, type IProfileJobBucket, type IProfileJobLocation, type IProfileUserStatus } from "~/types"
import { computedPaginatedTableSlice, formatIsoLocalDateTime, formatIsoLocalDateTimeMinutes, labelForSourceId, resolveApplyHref, resolveListingHref, toApiError } from "~/utils"

import { PaginatedDataTable } from "../../components"

const PAGE_SIZE = 50
const RUN_POLL_MS = 2500

type ProfileListView = IProfileJobBucket | "hidden"

export default defineComponent({
  name: "ProfilePage",

  components: {
    PaginatedDataTable,
  },

  setup() {
    const route = useRoute()

    const profileId = computed(() => {
      const raw = route.params.id
      const value = Array.isArray(raw) ? raw[0] : raw
      return typeof value === "string" ? value : ""
    })

    const listView = ref<ProfileListView>("TOP")
    const page = ref(1)
    const pageSize = PAGE_SIZE
    const actionError = ref<string | null>(null)
    const isSubmitting = ref(false)
    const patchingJobId = ref<string | null>(null)
    let pollTimer: ReturnType<typeof setInterval> | null = null

    const {
      data: latestRun,
      pending: latestPending,
      error: latestError,
      refresh: refreshLatest,
    } = useAsyncData(
      () => `profile-run:${profileId.value || "none"}`,
      () => {
        const id = profileId.value
        if (!id) return Promise.resolve(null)
        return fetchLatest(id)
      },
      { watch: [profileId] }
    )

    const {
      data: jobsPage,
      pending: jobsPending,
      error: jobsError,
      refresh: refreshJobs,
    } = useAsyncData(
      () => `profile-jobs:${profileId.value || "none"}:${listView.value}:${page.value}`,
      () => {
        const id = profileId.value
        if (!id) return Promise.resolve(null)
        return getProfileJobs(id, jobsQuery())
      },
      { watch: [profileId, listView, page] }
    )

    const jobsPayload = computed(() => {
      const data = jobsPage.value
      if (!data) return null
      return {
        items: data.jobs,
        total: data.total,
        page: data.page,
        limit: data.limit,
      }
    })

    const table = computedPaginatedTableSlice(jobsPayload, page)

    const isRunning = computed(() => latestRun.value?.status === "RUNNING")

    const isLoading = computed(() => {
      if (!profileId.value) return false
      const latestSettled = !latestPending.value || latestRun.value != null || latestError.value != null
      const jobsSettled = !jobsPending.value || jobsPage.value != null || jobsError.value != null
      return !latestSettled || !jobsSettled
    })

    const latestErrorMessage = computed(() => {
      const error = latestError.value
      if (!error) return null
      return toApiError(error).message
    })

    const jobsErrorMessage = computed(() => {
      const error = jobsError.value
      if (!error) return null
      return toApiError(error).message
    })

    const runDisabled = computed(() => !profileId.value || isSubmitting.value || isRunning.value)

    const runLabel = computed(() => {
      if (isSubmitting.value) return "Starting…"
      if (isRunning.value) return "Running…"
      return "Run"
    })

    function jobsQuery(): IGetProfileJobsQuery {
      const query: IGetProfileJobsQuery = { page: page.value, limit: pageSize }
      if (listView.value === "hidden") {
        query.user_status = "HIDDEN"
        return query
      }
      query.bucket = listView.value
      return query
    }

    async function fetchLatest(id: string) {
      try {
        return await getLatestProfileRun(id)
      } catch (e: unknown) {
        const error = toApiError(e)
        if (error.code === API_ERROR_CODES.ProfilesNoRun) return null
        throw error
      }
    }

    function selectList(view: ProfileListView) {
      if (listView.value === view) return
      page.value = 1
      listView.value = view
    }

    function listButtonClass(view: ProfileListView) {
      const base = "rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
      if (listView.value === view) return `${base} bg-btn-primary text-btn-text`
      return `${base} border border-border bg-white text-primary hover:bg-row-hover`
    }

    const linkActionClass = "cursor-pointer rounded-sm px-1 font-medium text-btn-primary transition-colors duration-200 hover:bg-blue-100 hover:text-blue-800 hover:underline"
    const jobActionClass = `${linkActionClass} underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50`

    function onPrev() {
      if (page.value > 1) page.value--
    }

    function onNext() {
      if (table.value.canNext) page.value++
    }

    function onGoto(nextPage: number) {
      if (jobsPending.value || patchingJobId.value != null) return
      if (nextPage < 1 || nextPage === page.value) return
      const last = table.value.total === 0 ? 1 : Math.ceil(table.value.total / pageSize)
      if (nextPage > last) return
      page.value = nextPage
    }

    async function onRun() {
      const id = profileId.value
      if (!id || runDisabled.value) return
      actionError.value = null
      isSubmitting.value = true
      try {
        const run = await postProfileRun(id, crypto.randomUUID())
        await refreshLatest()
        if (run.status !== "RUNNING") await refreshJobs()
      } catch (e: unknown) {
        const error = toApiError(e)
        actionError.value = error.message
        if (error.code === API_ERROR_CODES.ProfilesRunAlreadyRunning) await refreshLatest()
      } finally {
        isSubmitting.value = false
      }
    }

    async function onSetStatus(jobId: string, userStatus: IProfileUserStatus) {
      const id = profileId.value
      if (!id || patchingJobId.value) return
      actionError.value = null
      patchingJobId.value = jobId
      try {
        await patchProfileJob(id, jobId, { user_status: userStatus })
        await refreshJobs()
      } catch (e: unknown) {
        actionError.value = toApiError(e).message
      } finally {
        patchingJobId.value = null
      }
    }

    function rowNumber(index: number) {
      return (table.value.pageShown - 1) * pageSize + index + 1
    }

    function locationParts(location: IProfileJobLocation | undefined): string[] {
      const countries = location?.countries ?? []
      const regions = location?.regions ?? []
      return [...countries, ...regions].map((part) => part.trim()).filter((part) => part !== "")
    }

    function hasKnownLocation(location: IProfileJobLocation | undefined): boolean {
      return locationParts(location).length > 0
    }

    function formatLocation(location: IProfileJobLocation | undefined): string {
      return locationParts(location).join(", ")
    }

    function sourceLinks(row: IProfileJob) {
      const listing = resolveListingHref(row)
      const sources = row.sources ?? []
      if (sources.length === 0) {
        if (listing === "") return []
        return [{ key: `job:${listing}`, href: listing, label: "Link" }]
      }
      const links = sources.map((sourceId, i) => ({
        key: `${i}:${sourceId}`,
        href: listing,
        label: labelForSourceId(sourceId),
      }))
      if (links.length < 2) return links
      return links.map((link, index) => ({
        ...link,
        label: `${index + 1}. ${link.label}`,
      }))
    }

    function locationLinks(row: IProfileJob) {
      const links: { key: string; href: string; label: string }[] = []
      for (const [i, opening] of (row.openings ?? []).entries()) {
        const href = resolveApplyHref(opening)
        if (href === "") continue
        const country = opening.country.trim()
        links.push({
          key: `${i}:${href}`,
          href,
          label: country === "" ? "Apply" : country,
        })
      }
      if (links.length === 0) {
        const href = resolveApplyHref(row)
        if (href !== "") {
          const label = hasKnownLocation(row.location) ? formatLocation(row.location) : "Apply"
          links.push({ key: `job:${href}`, href, label })
        }
      }
      if (links.length < 2) return links
      return links.map((link, index) => ({
        ...link,
        label: `${index + 1}. ${link.label}`,
      }))
    }

    function postedCellClass(posted: string | null) {
      return posted == null || posted === "" ? "text-secondary" : "text-primary"
    }

    function formatPosted(posted: string | null): string {
      if (posted == null || posted === "") return "—"
      return formatIsoLocalDateTime(posted)
    }

    function clearPoll() {
      if (pollTimer != null) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    }

    watch(profileId, () => {
      page.value = 1
      listView.value = "TOP"
      actionError.value = null
    })

    watch(
      [isRunning, profileId],
      ([running, id]) => {
        clearPoll()
        if (!import.meta.client || !id || !running) return
        pollTimer = setInterval(() => {
          void refreshLatest()
          void refreshJobs()
        }, RUN_POLL_MS)
      },
      { immediate: true }
    )

    watch(isRunning, (running, wasRunning) => {
      if (wasRunning === true && !running) void refreshJobs()
    })

    onUnmounted(() => {
      clearPoll()
    })

    return {
      profileId,
      isLoading,
      latestRun,
      latestErrorMessage,
      actionError,
      runDisabled,
      runLabel,
      onRun,
      listView,
      selectList,
      listButtonClass,
      jobsErrorMessage,
      jobsPending,
      table,
      pageSize,
      patchingJobId,
      linkActionClass,
      jobActionClass,
      onPrev,
      onNext,
      onGoto,
      onSetStatus,
      rowNumber,
      sourceLinks,
      hasKnownLocation,
      formatLocation,
      locationLinks,
      postedCellClass,
      formatPosted,
      formatIsoLocalDateTimeMinutes,
    }
  },
})
</script>
