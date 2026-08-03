import type { AxiosRequestConfig } from "axios"

/**
 * Axios request config extended with app-specific metadata.
 *
 * @typeParam D - Request body type.
 */
export interface CustomAxiosRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  meta?: {
    /** When false, the auth interceptor skips attaching the bearer token. */
    requiresAuth?: boolean
  }
}

/**
 * Standard API response envelope used across backend endpoints.
 *
 * @typeParam ResponseData - Shape of the `data` field on success.
 */
export type ApiResponse<ResponseData = null> = {
  status: boolean
  message: string
  data: ResponseData | null
}

/** Common pagination query parameters for list endpoints. */
export type PaginationRequest = {
  page: number
  limit: number
  /** Optional free-text search term. */
  search?: string
}

/** Pagination metadata returned alongside list results. */
export type PaginationResponse = {
  page: number
  limit: number
  total: number
  total_page: number
}
