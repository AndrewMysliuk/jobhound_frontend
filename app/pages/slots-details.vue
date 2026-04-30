<template>
  <main id="main-content" class="flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8" :class="mainAlignClass">
    <div class="mx-auto w-full" :class="innerMaxWidthClass">
      <NuxtLink to="/" class="text-sm font-medium text-link transition-colors duration-200 hover:text-linkHover">← Searches</NuxtLink>

      <div v-if="!slotId" class="mt-8 rounded-card border border-border bg-cardBg p-8 shadow-sm">
        <h1 class="text-2xl font-semibold text-primary">Slot details</h1>
        <p class="mt-2 text-secondary">Open a search from the list to see details.</p>
      </div>

      <div v-else-if="isLoading" class="mt-8 text-sm text-secondary">Loading…</div>

      <div v-else-if="loadError" class="mt-8 text-sm text-destructive">{{ loadError }}</div>

      <div v-else-if="slotCard" class="mt-6">
        <div id="slot-header-section" class="mb-8">
          <h1 id="slot-title" class="mb-6 text-3xl font-semibold tracking-tight text-primary lg:text-4xl">
            {{ slotCard.name }}
          </h1>

          <UnderlineTabs v-model="activeStage" id-prefix="slot-detail-stages" :tabs="stageTabLabels" panel-wrapper-class="mt-8">
            <template #tab-0>
              <p v-if="s1Error" class="mb-3 text-sm text-destructive">{{ fetchErrorMessage(s1Error) }}</p>
              <PaginatedDataTable
                :page="s1Table.pageShown"
                :page-size="pageSize"
                :total="s1Table.total"
                :empty="!s1Pending && s1Table.items.length === 0"
                :can-prev="s1Table.canPrev"
                :can-next="s1Table.canNext"
                :navigation-disabled="interactionLocked"
                @prev="onS1Prev"
                @next="onS1Next"
              >
                <template #thead>
                  <tr class="border-b border-border bg-tableHeaderBg">
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Title</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Company</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Source ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">First Seen At</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Posted At</th>
                  </tr>
                </template>
                <template #tbody>
                  <tr v-for="row in s1Table.items" :key="row.job_id" class="cursor-pointer align-top hover:bg-rowHover">
                    <td class="px-6 py-4 text-sm font-medium text-primary">
                      <a
                        v-if="resolveApplyOrListingHref(row)"
                        :href="resolveApplyOrListingHref(row)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-link transition-colors duration-200 hover:text-linkHover hover:underline"
                        @click.stop
                        >{{ row.title }}</a
                      >
                      <template v-else>{{ row.title }}</template>
                    </td>
                    <td class="px-6 py-4 text-sm text-primary">{{ row.company }}</td>
                    <td class="px-6 py-4 font-mono text-sm text-primary">{{ row.source_id }}</td>
                    <td class="px-6 py-4 text-sm text-primary">{{ formatIsoLocalDateTime(row.first_seen_at) }}</td>
                    <td class="px-6 py-4 text-sm" :class="postedCellClass(row.posted_at)">{{ formatPosted(row.posted_at) }}</td>
                  </tr>
                </template>
              </PaginatedDataTable>
              <p v-if="s1Pending" class="mt-2 text-sm text-secondary">Updating…</p>
            </template>

            <template #tab-1>
              <div id="control-strip-section" class="mb-8">
                <p v-if="stage2RunError" class="mb-3 text-sm text-destructive">{{ stage2RunError }}</p>
                <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <KeywordChipInput v-model="includeKeywords" label="include" placeholder="Type and press space…" :disabled="interactionLocked" />
                  <KeywordChipInput v-model="excludeKeywords" label="exclude" placeholder="Type and press space…" :disabled="interactionLocked" />
                </div>
                <div class="flex justify-start">
                  <button
                    type="button"
                    class="rounded-lg bg-btnPrimary px-6 py-2.5 text-sm font-medium text-btnText transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="stage2SearchDisabled"
                    @click="onStage2Search"
                  >
                    {{ stage2SearchLabel }}
                  </button>
                </div>
              </div>

              <div id="tables-section" class="flex flex-col gap-6 lg:flex-row">
                <div class="w-full min-w-0 lg:flex-1">
                  <p v-if="s2pError" class="mb-3 text-sm text-destructive">{{ fetchErrorMessage(s2pError) }}</p>
                  <PaginatedDataTable
                    card-title="PASSED_STAGE_2"
                    density="compact"
                    :page="s2PassedTable.pageShown"
                    :page-size="pageSize"
                    :total="s2PassedTable.total"
                    :empty="!s2pPending && s2PassedTable.items.length === 0"
                    :can-prev="s2PassedTable.canPrev"
                    :can-next="s2PassedTable.canNext"
                    :navigation-disabled="interactionLocked"
                    @prev="onS2PassedPrev"
                    @next="onS2PassedNext"
                  >
                    <template #thead>
                      <tr class="border-b border-border bg-tableHeaderBg">
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Title</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Company</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Source ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">First Seen</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Posted</th>
                      </tr>
                    </template>
                    <template #tbody>
                      <tr v-for="row in s2PassedTable.items" :key="row.job_id" class="cursor-pointer align-top hover:bg-rowHover">
                        <td class="px-4 py-3 text-sm font-medium text-primary">
                          <a
                            v-if="resolveApplyOrListingHref(row)"
                            :href="resolveApplyOrListingHref(row)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-link transition-colors duration-200 hover:text-linkHover hover:underline"
                            @click.stop
                            >{{ row.title }}</a
                          >
                          <template v-else>{{ row.title }}</template>
                        </td>
                        <td class="px-4 py-3 text-sm text-primary">{{ row.company }}</td>
                        <td class="px-4 py-3 font-mono text-sm text-primary">{{ row.source_id }}</td>
                        <td class="px-4 py-3 text-sm text-primary">{{ formatIsoLocalDateTimeMinutes(row.first_seen_at) }}</td>
                        <td class="px-4 py-3 text-sm" :class="postedCellClass(row.posted_at)">{{ formatPostedShort(row.posted_at) }}</td>
                      </tr>
                    </template>
                  </PaginatedDataTable>
                  <p v-if="s2pPending" class="mt-2 text-sm text-secondary">Updating…</p>
                </div>

                <!-- <div class="w-full min-w-0 lg:flex-1">
                  <p v-if="s2rError" class="mb-3 text-sm text-destructive">{{ fetchErrorMessage(s2rError) }}</p>
                  <PaginatedDataTable
                    card-title="REJECTED_STAGE_2"
                    density="compact"
                    :page="s2RejectedTable.pageShown"
                    :page-size="pageSize"
                    :total="s2RejectedTable.total"
                    :empty="!s2rPending && s2RejectedTable.items.length === 0"
                    :can-prev="s2RejectedTable.canPrev"
                    :can-next="s2RejectedTable.canNext"
                    :navigation-disabled="interactionLocked"
                    @prev="onS2RejectedPrev"
                    @next="onS2RejectedNext"
                  >
                    <template #thead>
                      <tr class="border-b border-border bg-tableHeaderBg">
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Title</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Company</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Source ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">First Seen</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Posted</th>
                      </tr>
                    </template>
                    <template #tbody>
                      <tr v-for="row in s2RejectedTable.items" :key="row.job_id" class="cursor-pointer hover:bg-rowHover">
                        <td class="px-4 py-3 text-sm font-medium text-primary">
                          <a
                            v-if="resolveApplyOrListingHref(row)"
                            :href="resolveApplyOrListingHref(row)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-link transition-colors duration-200 hover:text-linkHover hover:underline"
                            @click.stop
                            >{{ row.title }}</a
                          >
                          <template v-else>{{ row.title }}</template>
                        </td>
                        <td class="px-4 py-3 text-sm text-primary">{{ row.company }}</td>
                        <td class="px-4 py-3 font-mono text-sm text-primary">{{ row.source_id }}</td>
                        <td class="px-4 py-3 text-sm text-primary">{{ formatIsoLocalDateTimeMinutes(row.first_seen_at) }}</td>
                        <td class="px-4 py-3 text-sm" :class="postedCellClass(row.posted_at)">{{ formatPostedShort(row.posted_at) }}</td>
                      </tr>
                    </template>
                  </PaginatedDataTable>
                  <p v-if="s2rPending" class="mt-2 text-sm text-secondary">Updating…</p>
                </div> -->
              </div>
            </template>

            <template #tab-2>
              <div id="action-section" class="mb-8">
                <p v-if="stage3RunError" class="mb-3 text-sm text-destructive">{{ stage3RunError }}</p>
                <div class="flex justify-start">
                  <button
                    type="button"
                    class="rounded-lg bg-btnPrimary px-6 py-2.5 text-sm font-medium text-btnText transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="stage3MatchDisabled"
                    @click="onStage3Match"
                  >
                    {{ stage3MatchLabel }}
                  </button>
                </div>
              </div>

              <div id="tables-section-stage3" class="flex flex-col gap-6 lg:flex-row">
                <div class="w-full min-w-0 lg:flex-1">
                  <p v-if="s3pError" class="mb-3 text-sm text-destructive">{{ fetchErrorMessage(s3pError) }}</p>
                  <PaginatedDataTable
                    card-title="PASSED_STAGE_3"
                    density="compact"
                    :page="s3PassedTable.pageShown"
                    :page-size="pageSize"
                    :total="s3PassedTable.total"
                    :empty="!s3pPending && s3PassedTable.items.length === 0"
                    :can-prev="s3PassedTable.canPrev"
                    :can-next="s3PassedTable.canNext"
                    :navigation-disabled="interactionLocked"
                    @prev="onS3PassedPrev"
                    @next="onS3PassedNext"
                  >
                    <template #thead>
                      <tr class="border-b border-border bg-tableHeaderBg">
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Title</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Company</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Source ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">First Seen</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Posted</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Rationale</th>
                      </tr>
                    </template>
                    <template #tbody>
                      <tr v-for="row in s3PassedTable.items" :key="row.job_id" class="cursor-pointer align-top hover:bg-rowHover">
                        <td class="px-4 py-3 text-sm font-medium text-primary">
                          <a
                            v-if="resolveApplyOrListingHref(row)"
                            :href="resolveApplyOrListingHref(row)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-link transition-colors duration-200 hover:text-linkHover hover:underline"
                            @click.stop
                            >{{ row.title }}</a
                          >
                          <template v-else>{{ row.title }}</template>
                        </td>
                        <td class="px-4 py-3 text-sm text-primary">{{ row.company }}</td>
                        <td class="px-4 py-3 font-mono text-sm text-primary">{{ row.source_id }}</td>
                        <td class="px-4 py-3 text-sm text-primary">{{ formatIsoLocalDateTimeMinutes(row.first_seen_at) }}</td>
                        <td class="px-4 py-3 text-sm" :class="postedCellClass(row.posted_at)">{{ formatPostedShort(row.posted_at) }}</td>
                        <td class="max-w-xs truncate px-4 py-3 text-sm" :class="rationaleCellClass(row.stage_3_rationale)">
                          {{ formatRationale(row.stage_3_rationale) }}
                        </td>
                      </tr>
                    </template>
                  </PaginatedDataTable>
                  <p v-if="s3pPending" class="mt-2 text-sm text-secondary">Updating…</p>
                </div>

                <!-- <div class="w-full min-w-0 lg:flex-1">
                  <p v-if="s3rError" class="mb-3 text-sm text-destructive">{{ fetchErrorMessage(s3rError) }}</p>
                  <PaginatedDataTable
                    card-title="REJECTED_STAGE_3"
                    density="compact"
                    :show-pagination="s3RejectedTable.total > 0"
                    :page="s3RejectedTable.pageShown"
                    :page-size="pageSize"
                    :total="s3RejectedTable.total"
                    :empty="!s3rPending && s3RejectedTable.items.length === 0"
                    :can-prev="s3RejectedTable.canPrev"
                    :can-next="s3RejectedTable.canNext"
                    :navigation-disabled="interactionLocked"
                    @prev="onS3RejectedPrev"
                    @next="onS3RejectedNext"
                  >
                    <template #thead>
                      <tr class="border-b border-border bg-tableHeaderBg">
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Title</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Company</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Source ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">First Seen</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Posted</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary">Rationale</th>
                      </tr>
                    </template>
                    <template #tbody>
                      <tr v-for="row in s3RejectedTable.items" :key="row.job_id" class="cursor-pointer hover:bg-rowHover">
                        <td class="px-4 py-3 text-sm font-medium text-primary">
                          <a
                            v-if="resolveApplyOrListingHref(row)"
                            :href="resolveApplyOrListingHref(row)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-link transition-colors duration-200 hover:text-linkHover hover:underline"
                            @click.stop
                            >{{ row.title }}</a
                          >
                          <template v-else>{{ row.title }}</template>
                        </td>
                        <td class="px-4 py-3 text-sm text-primary">{{ row.company }}</td>
                        <td class="px-4 py-3 font-mono text-sm text-primary">{{ row.source_id }}</td>
                        <td class="px-4 py-3 text-sm text-primary">{{ formatIsoLocalDateTimeMinutes(row.first_seen_at) }}</td>
                        <td class="px-4 py-3 text-sm" :class="postedCellClass(row.posted_at)">{{ formatPostedShort(row.posted_at) }}</td>
                        <td class="max-w-xs truncate px-4 py-3 text-sm" :class="rationaleCellClass(row.stage_3_rationale)">
                          {{ formatRationale(row.stage_3_rationale) }}
                        </td>
                      </tr>
                    </template>
                  </PaginatedDataTable>
                  <p v-if="s3rPending" class="mt-2 text-sm text-secondary">Updating…</p>
                </div> -->
              </div>
            </template>
          </UnderlineTabs>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, watch } from "vue"

import { getSlot, getStageJobs, postStage2Run, postStage3Run } from "~/api/publicApi"
import {
  computedPaginatedTableSlice,
  formatIsoLocalDateTime,
  formatIsoLocalDateTimeMinutes,
  maxJobsFromStage3Payload,
  resolveApplyOrListingHref,
  stage2KeywordsFromPayload,
  stage2PayloadSignature,
  stage3PayloadSignature,
} from "~/utils"
import { KeywordChipInput, PaginatedDataTable, UnderlineTabs } from "../components"
import { ApiError, DefaultJobListLimit } from "~/types"

const STAGE3_DEFAULT_MAX_JOBS = 99
const SLOT_POLL_MS = 2500

export default defineComponent({
  name: "SlotsDetailsPage",

  components: {
    KeywordChipInput,
    PaginatedDataTable,
    UnderlineTabs,
  },

  setup() {
    const route = useRoute()

    const slotId = computed(() => {
      const raw = route.query.slot
      return typeof raw === "string" && raw.length > 0 ? raw : ""
    })

    const {
      data: slotCard,
      pending: isLoading,
      error,
      refresh: refreshSlotCard,
    } = useAsyncData(
      () => `slot-detail:${slotId.value || "none"}`,
      () => {
        const id = slotId.value
        if (!id) return Promise.resolve(null)
        return getSlot(id)
      },
      { watch: [slotId] },
    )

    const loadError = computed(() => {
      const e = error.value
      if (!e) return null
      return e instanceof Error ? e.message : String(e)
    })

    const anyStageRunning = computed(() => {
      const c = slotCard.value
      if (!c) return false
      return c.stage_1.state === "running" || c.stage_2.state === "running" || c.stage_3.state === "running"
    })

    const innerMaxWidthClass = computed(() => {
      if (!slotId.value || loadError.value) return "max-w-2xl"
      return "max-w-[1280px]"
    })

    const mainAlignClass = computed(() => {
      if (!slotId.value || loadError.value) return "items-center"
      return ""
    })

    const activeStage = ref(0)
    const stageTabLabels = ["Stage 1", "Stage 2", "Stage 3"]
    const pageSize = DefaultJobListLimit

    const s1Page = ref(1)
    const s2PassedPage = ref(1)
    const s2RejectedPage = ref(1)
    const s3PassedPage = ref(1)
    const s3RejectedPage = ref(1)

    const {
      data: s1Data,
      pending: s1Pending,
      error: s1Error,
      refresh: refreshS1,
    } = useAsyncData(
      () => `slot-jobs:1:${slotId.value}:${s1Page.value}`,
      () => {
        const id = slotId.value
        if (!id) return Promise.resolve(null)
        return getStageJobs(id, 1, { page: s1Page.value, limit: pageSize })
      },
      { watch: [slotId, s1Page] },
    )

    const {
      data: s2pData,
      pending: s2pPending,
      error: s2pError,
      refresh: refreshS2Passed,
    } = useAsyncData(
      () => `slot-jobs:2p:${slotId.value}:${s2PassedPage.value}`,
      () => {
        const id = slotId.value
        if (!id) return Promise.resolve(null)
        return getStageJobs(id, 2, {
          page: s2PassedPage.value,
          limit: pageSize,
          status: "PASSED_STAGE_2",
        })
      },
      { watch: [slotId, s2PassedPage] },
    )

    const {
      data: s2rData,
      pending: s2rPending,
      error: s2rError,
      refresh: refreshS2Rejected,
    } = useAsyncData(
      () => `slot-jobs:2r:${slotId.value}:${s2RejectedPage.value}`,
      () => {
        const id = slotId.value
        if (!id) return Promise.resolve(null)
        return getStageJobs(id, 2, {
          page: s2RejectedPage.value,
          limit: pageSize,
          status: "REJECTED_STAGE_2",
        })
      },
      { watch: [slotId, s2RejectedPage] },
    )

    const {
      data: s3pData,
      pending: s3pPending,
      error: s3pError,
      refresh: refreshS3Passed,
    } = useAsyncData(
      () => `slot-jobs:3p:${slotId.value}:${s3PassedPage.value}`,
      () => {
        const id = slotId.value
        if (!id) return Promise.resolve(null)
        return getStageJobs(id, 3, {
          page: s3PassedPage.value,
          limit: pageSize,
          status: "PASSED_STAGE_3",
        })
      },
      { watch: [slotId, s3PassedPage] },
    )

    const {
      data: s3rData,
      pending: s3rPending,
      error: s3rError,
      refresh: refreshS3Rejected,
    } = useAsyncData(
      () => `slot-jobs:3r:${slotId.value}:${s3RejectedPage.value}`,
      () => {
        const id = slotId.value
        if (!id) return Promise.resolve(null)
        return getStageJobs(id, 3, {
          page: s3RejectedPage.value,
          limit: pageSize,
          status: "REJECTED_STAGE_3",
        })
      },
      { watch: [slotId, s3RejectedPage] },
    )

    const includeKeywords = ref<string[]>([])
    const excludeKeywords = ref<string[]>([])
    const stage3MaxJobs = ref(STAGE3_DEFAULT_MAX_JOBS)

    const lastStagePayloadSync = ref<{ slotId: string; s2Sig: string; s3Sig: string } | null>(null)

    const isStage2Submitting = ref(false)
    const isStage3Submitting = ref(false)
    const stage2RunError = ref<string | null>(null)
    const stage3RunError = ref<string | null>(null)
    let slotPollTimer: ReturnType<typeof setInterval> | null = null

    /** Any stage running or a run request in flight — lock UI on every tab to avoid conflicting actions. */
    const interactionLocked = computed(() => anyStageRunning.value || isStage2Submitting.value || isStage3Submitting.value)

    const runningStageHeadline = computed(() => {
      const c = slotCard.value
      if (!c) return "Pipeline running…"
      if (c.stage_1.state === "running") return "Stage 1 running…"
      if (c.stage_2.state === "running") return "Stage 2 running…"
      if (c.stage_3.state === "running") return "Stage 3 running…"
      return "Pipeline running…"
    })

    const stage2SearchDisabled = computed(() => !slotId.value || interactionLocked.value)

    const stage2SearchLabel = computed(() => {
      if (isStage2Submitting.value) return "Starting…"
      if (slotCard.value?.stage_2.state === "running") return "Stage 2 running…"
      if (anyStageRunning.value) return runningStageHeadline.value
      return "Search"
    })

    const stage3MatchDisabled = computed(() => !slotId.value || interactionLocked.value)

    const stage3MatchLabel = computed(() => {
      if (isStage3Submitting.value) return "Starting…"
      if (slotCard.value?.stage_3.state === "running") return "Stage 3 running…"
      if (anyStageRunning.value) return runningStageHeadline.value
      return "Match vacancies by profile"
    })

    const s1Table = computedPaginatedTableSlice(s1Data, s1Page)
    const s2PassedTable = computedPaginatedTableSlice(s2pData, s2PassedPage)
    const s2RejectedTable = computedPaginatedTableSlice(s2rData, s2RejectedPage)
    const s3PassedTable = computedPaginatedTableSlice(s3pData, s3PassedPage)
    const s3RejectedTable = computedPaginatedTableSlice(s3rData, s3RejectedPage)

    function onS1Prev() {
      if (s1Page.value > 1) s1Page.value--
    }
    function onS1Next() {
      if (s1Table.value.canNext) s1Page.value++
    }
    function onS2PassedPrev() {
      if (s2PassedPage.value > 1) s2PassedPage.value--
    }
    function onS2PassedNext() {
      if (s2PassedTable.value.canNext) s2PassedPage.value++
    }
    function onS2RejectedPrev() {
      if (s2RejectedPage.value > 1) s2RejectedPage.value--
    }
    function onS2RejectedNext() {
      if (s2RejectedTable.value.canNext) s2RejectedPage.value++
    }
    function onS3PassedPrev() {
      if (s3PassedPage.value > 1) s3PassedPage.value--
    }
    function onS3PassedNext() {
      if (s3PassedTable.value.canNext) s3PassedPage.value++
    }
    function onS3RejectedPrev() {
      if (s3RejectedPage.value > 1) s3RejectedPage.value--
    }
    function onS3RejectedNext() {
      if (s3RejectedTable.value.canNext) s3RejectedPage.value++
    }

    async function onStage2Search() {
      const id = slotId.value
      if (!id || stage2SearchDisabled.value) return
      stage2RunError.value = null
      isStage2Submitting.value = true
      try {
        await postStage2Run(id, { include: includeKeywords.value, exclude: excludeKeywords.value })
        await refreshSlotCard()
        await Promise.all([refreshS2Passed(), refreshS2Rejected(), refreshS3Passed(), refreshS3Rejected()])
      } catch (e) {
        stage2RunError.value = e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e)
      } finally {
        isStage2Submitting.value = false
      }
    }

    async function onStage3Match() {
      const id = slotId.value
      if (!id || stage3MatchDisabled.value) return
      stage3RunError.value = null
      isStage3Submitting.value = true
      try {
        await postStage3Run(id, { max_jobs: stage3MaxJobs.value })
        await refreshSlotCard()
        await Promise.all([refreshS3Passed(), refreshS3Rejected()])
      } catch (e) {
        stage3RunError.value = e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e)
      } finally {
        isStage3Submitting.value = false
      }
    }

    function clearSlotPoll() {
      if (slotPollTimer != null) {
        clearInterval(slotPollTimer)
        slotPollTimer = null
      }
    }

    async function refreshAllStageJobLists() {
      await Promise.all([refreshS1(), refreshS2Passed(), refreshS2Rejected(), refreshS3Passed(), refreshS3Rejected()])
    }

    function postedCellClass(posted: string | null) {
      return posted == null || posted === "" ? "text-secondary" : "text-primary"
    }

    function formatPosted(posted: string | null): string {
      if (posted == null || posted === "") return "—"
      return formatIsoLocalDateTime(posted)
    }

    function formatPostedShort(posted: string | null): string {
      if (posted == null || posted === "") return "—"
      return formatIsoLocalDateTimeMinutes(posted)
    }

    function formatRationale(r: string | null): string {
      if (r == null || r === "") return "—"
      return r
    }

    function rationaleCellClass(r: string | null) {
      return r == null || r === "" ? "text-secondary" : "text-primary"
    }

    function fetchErrorMessage(e: unknown): string {
      return e instanceof Error ? e.message : String(e)
    }

    watch(slotId, () => {
      s1Page.value = 1
      s2PassedPage.value = 1
      s2RejectedPage.value = 1
      s3PassedPage.value = 1
      s3RejectedPage.value = 1
      lastStagePayloadSync.value = null
    })

    watch(
      () => [slotId.value, slotCard.value] as const,
      ([id, card]) => {
        if (!id || !card || card.id !== id) return
        const s2Sig = stage2PayloadSignature(card.stage_2.payload)
        const s3Sig = stage3PayloadSignature(card.stage_3.payload)
        const prev = lastStagePayloadSync.value
        if (prev && prev.slotId === id && prev.s2Sig === s2Sig && prev.s3Sig === s3Sig) return
        lastStagePayloadSync.value = { slotId: id, s2Sig, s3Sig }

        const kw = stage2KeywordsFromPayload(card.stage_2.payload)
        if (kw) {
          includeKeywords.value = kw.include
          excludeKeywords.value = kw.exclude
        } else {
          includeKeywords.value = []
          excludeKeywords.value = []
        }

        const mj = maxJobsFromStage3Payload(card.stage_3.payload)
        stage3MaxJobs.value = mj ?? STAGE3_DEFAULT_MAX_JOBS
      },
      { immediate: true },
    )

    watch(
      [anyStageRunning, slotId],
      ([running]) => {
        clearSlotPoll()
        if (!slotId.value || !running) return
        slotPollTimer = setInterval(() => {
          void refreshSlotCard()
        }, SLOT_POLL_MS)
      },
      { immediate: true },
    )

    watch(anyStageRunning, (running, wasRunning) => {
      if (!running && wasRunning === true) {
        void refreshAllStageJobLists()
      }
    })

    onUnmounted(() => {
      clearSlotPoll()
    })

    return {
      slotId,
      slotCard,
      isLoading,
      loadError,
      innerMaxWidthClass,
      mainAlignClass,
      activeStage,
      stageTabLabels,
      pageSize,
      includeKeywords,
      excludeKeywords,
      s1Error,
      s1Pending,
      s1Table,
      onS1Prev,
      onS1Next,
      s2pError,
      s2pPending,
      s2PassedTable,
      onS2PassedPrev,
      onS2PassedNext,
      s2rError,
      s2rPending,
      s2RejectedTable,
      onS2RejectedPrev,
      onS2RejectedNext,
      s3pError,
      s3pPending,
      s3PassedTable,
      onS3PassedPrev,
      onS3PassedNext,
      s3rError,
      s3rPending,
      s3RejectedTable,
      onS3RejectedPrev,
      onS3RejectedNext,
      stage2RunError,
      stage3RunError,
      interactionLocked,
      stage2SearchDisabled,
      stage2SearchLabel,
      stage3MatchDisabled,
      stage3MatchLabel,
      onStage2Search,
      onStage3Match,
      postedCellClass,
      formatPosted,
      formatPostedShort,
      formatIsoLocalDateTime,
      formatIsoLocalDateTimeMinutes,
      formatRationale,
      rationaleCellClass,
      fetchErrorMessage,
      resolveApplyOrListingHref,
    }
  },
})
</script>
