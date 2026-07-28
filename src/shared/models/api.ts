import type { AxiosRequestConfig } from "axios"

/**
 * Custom Axios config that supports `meta.requiresAuth` flag.
 */
export interface CustomAxiosRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  meta?: {
    requiresAuth?: boolean
  }
}

export type ApiResponse<ResponseData = null> = {
  status: boolean
  message: string
  data: ResponseData | null
}

export type PaginationRequest = {
  page: number
  limit: number
  search?: string
}

export type PaginationResponse = {
  page: number
  limit: number
  total: number
  total_page: number
}
