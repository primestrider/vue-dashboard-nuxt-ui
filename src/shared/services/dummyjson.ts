/**
 * DummyJSON client used by the example features.
 *
 * @remarks
 * Reuses the shared axios instance (and its interceptors) but points each
 * request at DummyJSON instead of `VITE_API_BASE_URL`. DummyJSON is public,
 * so the bearer token is never attached.
 *
 * Write endpoints (`POST`, `PUT`, `DELETE`) are simulated by DummyJSON: they
 * return the resulting record but nothing is persisted on the server.
 */

import axiosInstance from "@/plugins/axios"
import type { CustomAxiosRequestConfig } from "@/shared/models/api"

export const DUMMYJSON_BASE_URL = "https://dummyjson.com"

/**
 * Sends a request to DummyJSON and returns the response body.
 *
 * @param config - Axios config; `url` is relative to {@link DUMMYJSON_BASE_URL}.
 */
export const requestDummyJson = async <ResponseData, RequestData = unknown>(
  config: CustomAxiosRequestConfig<RequestData>,
): Promise<ResponseData> => {
  const configRequest: CustomAxiosRequestConfig<RequestData> = {
    ...config,
    baseURL: DUMMYJSON_BASE_URL,
    meta: {
      ...config.meta,
      requiresAuth: false,
    },
  }

  const { data } = await axiosInstance.request<ResponseData>(configRequest)

  return data
}

/**
 * Converts a 1-based page number into DummyJSON's `skip` offset.
 *
 * @param page - 1-based page number.
 * @param limit - Page size.
 */
export const pageToSkip = (page: number, limit: number): number => Math.max(page - 1, 0) * limit
