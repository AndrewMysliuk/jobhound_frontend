import { publicApiRequest } from "./client"
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

export async function getProfile(): Promise<IProfileResponse> {
  return publicApiRequest<IProfileResponse>("/profile", { method: "GET" })
}

export async function putProfile(body: IProfilePutRequest): Promise<IProfileResponse> {
  return publicApiRequest<IProfileResponse>("/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export async function getSlots(): Promise<ISlotsListResponse> {
  return publicApiRequest<ISlotsListResponse>("/slots", { method: "GET" })
}

/**
 * `Idempotency-Key` must be a non-nil UUID (server validates).
 * 200/201 both return a slot card.
 */
export async function postSlots(name: string, idempotencyKey: string): Promise<ISlotCard> {
  const body: ICreateSlotRequest = { name }
  return publicApiRequest<ISlotCard>("/slots", {
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
  return publicApiRequest<ISlotCard>(`/slots/${id}`, { method: "GET" })
}

export async function deleteSlot(slotId: string): Promise<void> {
  const id = encodeURIComponent(slotId)
  await publicApiRequest<undefined>(`/slots/${id}`, { method: "DELETE" })
}

export async function postStage2Run(slotId: string, body: IStage2RunRequest): Promise<IStageRunAcceptedResponse> {
  const id = encodeURIComponent(slotId)
  return publicApiRequest<IStageRunAcceptedResponse>(`/slots/${id}/stages/2/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export async function postStage3Run(slotId: string, body: IStage3RunRequest): Promise<IStageRunAcceptedResponse> {
  const id = encodeURIComponent(slotId)
  return publicApiRequest<IStageRunAcceptedResponse>(`/slots/${id}/stages/3/run`, {
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
  if (query?.status != null && query.status !== "") params.set("status", query.status)
  const qs = params.toString()
  const path = `/slots/${id}/stages/${stage}/jobs${qs ? `?${qs}` : ""}`
  return publicApiRequest<IJobListResponse>(path, { method: "GET" })
}

export async function patchStageJobBucket(
  slotId: string,
  stage: 2 | 3,
  jobId: string,
  body: IPatchJobBucketRequest
): Promise<IPatchJobBucketResponse> {
  const sid = encodeURIComponent(slotId)
  const jid = encodeURIComponent(jobId)
  return publicApiRequest<IPatchJobBucketResponse>(`/slots/${sid}/stages/${stage}/jobs/${jid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
