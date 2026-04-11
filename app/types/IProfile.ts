/** GET/PUT /api/v1/profile 200 body (`schema/profile.go`). Dates are RFC3339 strings. */
export interface IProfileResponse {
  text: string
  updated_at: string
}

/** PUT /api/v1/profile JSON body. */
export interface IProfilePutRequest {
  text: string
}
