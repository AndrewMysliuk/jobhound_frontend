import type {
  ICreateSlotRequest,
  IGetStageJobsQuery,
  IJobListResponse,
  IPatchJobBucketRequest,
  IPatchJobBucketResponse,
  IProfilePutRequest,
  IProfileResponse,
  ISlotCard,
  ISlotsListResponse,
  IStage2RunRequest,
  IStage3RunRequest,
  IStageRunAcceptedResponse,
} from "~/types"
import { DefaultJobListLimit } from "~/types"
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

export async function getProfile(): Promise<IProfileResponse> {
  return requestJson<IProfileResponse>("/profile", { method: "GET" })
}

export async function putProfile(body: IProfilePutRequest): Promise<IProfileResponse> {
  return requestJson<IProfileResponse>("/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export async function getSlots(): Promise<ISlotsListResponse> {
  return requestJson<ISlotsListResponse>("/slots", { method: "GET" })
}

export async function postSlots(name: string, idempotencyKey: string): Promise<ISlotCard> {
  const body: ICreateSlotRequest = { name }
  return requestJson<ISlotCard>("/slots", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  })
}

export async function getSlot(slotId: string): Promise<ISlotCard> {
  const id = encodeURIComponent(slotId)
  return requestJson<ISlotCard>(`/slots/${id}`, { method: "GET" })
}

export async function deleteSlot(slotId: string): Promise<void> {
  const id = encodeURIComponent(slotId)
  await requestJson<void>(`/slots/${id}`, { method: "DELETE" })
}

export async function postStage2Run(slotId: string, body: IStage2RunRequest): Promise<IStageRunAcceptedResponse> {
  const id = encodeURIComponent(slotId)
  return requestJson<IStageRunAcceptedResponse>(`/slots/${id}/stages/2/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export async function postStage3Run(slotId: string, body: IStage3RunRequest): Promise<IStageRunAcceptedResponse> {
  const id = encodeURIComponent(slotId)
  return requestJson<IStageRunAcceptedResponse>(`/slots/${id}/stages/3/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export async function getStageJobs(slotId: string, stage: 1 | 2 | 3, query?: IGetStageJobsQuery): Promise<IJobListResponse> {
  const id = encodeURIComponent(slotId)
  const params = new URLSearchParams()
  if (query?.page != null) params.set("page", String(query.page))
  if (query?.limit != null) params.set("limit", String(query.limit))
  if (query?.status != null) params.set("status", query.status)
  const qs = params.toString()
  const path = `/slots/${id}/stages/${stage}/jobs${qs ? `?${qs}` : ""}`
  return requestJson<IJobListResponse>(path, { method: "GET" })
}

export async function getStage2EligibleJobs(slotId: string, query?: Pick<IGetStageJobsQuery, "page" | "limit">): Promise<IJobListResponse> {
  const page = query?.page ?? 1
  const limit = query?.limit ?? DefaultJobListLimit
  return getStageJobs(slotId, 2, { page, limit, status: "ELIGIBLE_STAGE_2" })
}

export async function patchStageJobBucket(slotId: string, stage: 2 | 3, jobId: string, body: IPatchJobBucketRequest): Promise<IPatchJobBucketResponse> {
  const sid = encodeURIComponent(slotId)
  const jid = encodeURIComponent(jobId)
  return requestJson<IPatchJobBucketResponse>(`/slots/${sid}/stages/${stage}/jobs/${jid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
