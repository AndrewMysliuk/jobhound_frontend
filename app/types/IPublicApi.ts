/**
 * Wire types for slot/job/stage payloads (`internal/publicapi/schema/*.go`).
 * Time fields are ISO/RFC3339 strings.
 */

export type IStageState = "idle" | "running" | "succeeded" | "failed"

export interface IStageError {
  code: string
  message: string
}

export interface IStageCompact {
  state: IStageState
}

export interface IStageFull {
  state: IStageState
  started_at: string | null
  finished_at: string | null
  error: IStageError | null
}

export interface ISlotListItem {
  id: string
  name: string
  created_at: string
  stage_1: IStageCompact
  stage_2: IStageCompact
  stage_3: IStageCompact
}

export interface ISlotsListResponse {
  slots: ISlotListItem[]
}

export interface ISlotCard {
  id: string
  name: string
  created_at: string
  stage_1: IStageFull
  stage_2: IStageFull
  stage_3: IStageFull
}

export interface ICreateSlotRequest {
  name: string
}

/** Default page size for GET …/jobs (`schema/jobs.go`). */
export const DefaultJobListLimit = 50
export const MaxJobListLimit = 100

/** Allowed `?status=` values for stages 2–3 (`get_stage_jobs.go`). */
export type IJobListStatusFilter = "PASSED_STAGE_2" | "REJECTED_STAGE_2" | "PASSED_STAGE_3" | "REJECTED_STAGE_3"

export interface IJobListItem {
  job_id: string
  title: string
  company: string
  source_id: string
  /** Listing / canonical job page (domain `Job.URL`). */
  url: string
  /** External apply link when known; may be empty — prefer `url` as fallback. */
  apply_url: string
  first_seen_at: string
  posted_at: string | null
  /** Present for stage 2/3 lists; omitted for stage 1. */
  status?: string
  /** Always JSON null when absent (never omitted). */
  stage_3_rationale: string | null
}

export interface IJobListResponse {
  items: IJobListItem[]
  page: number
  limit: number
  total: number
}

export interface IGetStageJobsQuery {
  page?: number
  limit?: number
  /** Only for stages 2 and 3. */
  status?: IJobListStatusFilter | string
}

export interface IStage2RunRequest {
  include: string[]
  exclude: string[]
}

export interface IStage3RunRequest {
  max_jobs: number
}

export interface IStageRunAcceptedResponse {
  slot_id: string
  stage: number
}

export type IJobBucket = "passed" | "failed"

export interface IPatchJobBucketRequest {
  bucket: IJobBucket
}

export interface IPatchJobBucketResponse {
  job_id: string
  bucket: IJobBucket
}
