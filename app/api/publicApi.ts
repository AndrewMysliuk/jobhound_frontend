import type { IGetProfileJobsQuery, IPatchProfileJobRequest, IProfileJob, IProfileJobPage, IProfileRun, IProfilesListResponse } from "~/types"
import { toApiError } from "~/utils"

import { readApiJson } from "./_shared"
import { apiFetch } from "./apiFetch"

const API_V1_PREFIX = "/api/v1"

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const config = useRuntimeConfig()
  const base = String(config.public.apiBaseUrl).replace(/\/$/, "")
  const url = `${base}${API_V1_PREFIX}${path.startsWith("/") ? path : `/${path}`}`

  try {
    const res = await apiFetch(url, init)
    return await readApiJson<T>(res)
  } catch (e: unknown) {
    throw toApiError(e)
  }
}

export async function getProfiles(): Promise<IProfilesListResponse> {
  return requestJson<IProfilesListResponse>("/profiles", { method: "GET" })
}

export async function postProfileRun(profileId: string, idempotencyKey: string): Promise<IProfileRun> {
  const id = encodeURIComponent(profileId)
  return requestJson<IProfileRun>(`/profiles/${id}/runs`, {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  })
}

export async function getLatestProfileRun(profileId: string): Promise<IProfileRun> {
  const id = encodeURIComponent(profileId)
  return requestJson<IProfileRun>(`/profiles/${id}/runs/latest`, { method: "GET" })
}

export async function getProfileJobs(profileId: string, query?: IGetProfileJobsQuery): Promise<IProfileJobPage> {
  const id = encodeURIComponent(profileId)
  const params = new URLSearchParams()
  if (query?.bucket != null) params.set("bucket", query.bucket)
  if (query?.user_status != null) params.set("user_status", query.user_status)
  if (query?.page != null) params.set("page", String(query.page))
  if (query?.limit != null) params.set("limit", String(query.limit))
  const qs = params.toString()
  const path = `/profiles/${id}/jobs${qs ? `?${qs}` : ""}`
  return requestJson<IProfileJobPage>(path, { method: "GET" })
}

export async function patchProfileJob(profileId: string, jobId: string, body: IPatchProfileJobRequest): Promise<IProfileJob> {
  const pid = encodeURIComponent(profileId)
  const jid = encodeURIComponent(jobId)
  return requestJson<IProfileJob>(`/profiles/${pid}/jobs/${jid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
