import { ref } from "vue"
import type { Ref } from "vue"

/**
 * useBaseFieldError
 *
 * Helper composable to merge:
 * - Client-side validation errors (vee-validate)
 * - Backend error (single field)
 *
 * Rules:
 * - Backend error has higher priority
 * - Backend error applies to only one field
 * - Backend error is cleared when user edits that field
 *
 * @template T - Form values type
 *
 * @param clientErrors - Reactive vee-validate errors object
 */
export const useBaseFieldError = <T extends Record<string, unknown>>(
  clientErrors: Ref<Partial<Record<keyof T, string>>>,
) => {
  /**
   * Backend error message.
   */
  const serverError = ref<string | null>(null)

  /**
   * Field name that the backend error belongs to.
   */
  const errorTargetField = ref<keyof T | null>(null)

  /**
   * Assign backend error to a specific field.
   *
   * @param field - Target field name
   * @param message - Backend error message
   */
  const setBackendError = (field: keyof T, message: string) => {
    serverError.value = message
    errorTargetField.value = field
  }

  /**
   * Clear backend error when user edits the field.
   *
   * @param field - Edited field name
   */
  const clearBackendError = (field: keyof T) => {
    if (errorTargetField.value === field) {
      serverError.value = null
      errorTargetField.value = null
    }
  }

  /**
   * Resolve error message for a field.
   *
   * Priority:
   * 1. Backend error
   * 2. Client-side validation error
   *
   * @param field - Field name
   * @returns Error message or undefined
   */
  const fieldError = <K extends keyof T>(field: K) =>
    errorTargetField.value === field
      ? (serverError.value ?? clientErrors.value[field])
      : clientErrors.value[field]

  return {
    serverError,
    errorTargetField,
    setBackendError,
    clearBackendError,
    fieldError,
  }
}
