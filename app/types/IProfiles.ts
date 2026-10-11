/**
 * Wire types for `/api/v1/profiles/*`.
 * Time fields are ISO/RFC3339 strings.
 */

export type IProfileDomain = "software" | "architecture"

export interface IProfileListItem {
  id: string
  name: string
  domain: IProfileDomain
  sources: string[]
  queries: string[]
}

export interface IProfilesListResponse {
  profiles: IProfileListItem[]
}

export type IProfileRunStatus = "RUNNING" | "SUCCEEDED" | "FAILED"

export interface IProfileRun {
  run_id: number
  profile_id?: string
  status: IProfileRunStatus
  started_at: string
  finished_at?: string | null
  jobs_scored?: number
  sources_skipped?: number
}

export type IProfileJobBucket = "PASSED" | "REJECTED"

export type IProfileUserStatus = "NEW" | "HIDDEN"

export type IProfileLocationType = "remote" | "hybrid" | "office"

export interface IProfileJobLocation {
  type: IProfileLocationType
  regions: string[]
  countries: string[]
  timezone: string
  raw: string
}

export type IProfileSignalCode = "QUERY" | "PENALTY" | "CUT_EXCLUDE_TITLE" | "CUT_EXCLUDE_TEXT" | "CUT_LOCATION"

export interface IProfileSignal {
  code: IProfileSignalCode
  points: number
  terms?: string[]
}

export interface IProfileJob {
  job_id: string
  title: string
  company: string
  url: string
  apply_url: string
  location: IProfileJobLocation
  sources: string[]
  posted_at: string | null
  first_seen_at: string
  last_seen_at: string
  bucket: IProfileJobBucket
  score: number
  signals: IProfileSignal[]
  user_status: IProfileUserStatus
}

export interface IProfileJobPage {
  page: number
  limit: number
  total: number
  jobs: IProfileJob[]
}

export interface IGetProfileJobsQuery {
  bucket?: IProfileJobBucket
  user_status?: IProfileUserStatus
  page?: number
  limit?: number
}

export interface IPatchProfileJobRequest {
  user_status: IProfileUserStatus
}
