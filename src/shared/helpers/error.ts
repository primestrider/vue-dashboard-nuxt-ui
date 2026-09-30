import type { ApiError } from "@/shared/models/api"

/**
 * Narrows an unknown rejection into the {@link ApiError} shape produced by the
 * axios response interceptor.
 */
const isApiError = (error: unknown): error is ApiError =>
  typeof error === "object" && error !== null && "message" in error

/**
 * Extracts a human-readable message from a failed request.
 *
 * @param error - Value rejected by a service call.
 * @param fallback - Message used when nothing readable is available.
 * @returns The server message when present, otherwise the transport message or fallback.
 */
export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong."): string => {
  if (!isApiError(error)) {
    return fallback
  }

  const serverMessage =
    typeof error.data === "object" && error.data !== null && "message" in error.data
      ? error.data.message
      : undefined

  if (typeof serverMessage === "string" && serverMessage) {
    return serverMessage
  }

  return error.message || fallback
}
