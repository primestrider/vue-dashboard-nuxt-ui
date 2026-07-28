import type { DATE_FNS_LOCALES } from "../helpers/date"

export enum UtilsPageName {
  PAGE_NOT_FOUND = "PageNotFound",
}

export type BaseFormFieldProps = {
  /**
   * Field label text
   */
  label?: string

  /**
   * Field name / id (used for label-for & accessibility)
   */
  fieldName?: string

  /**
   * Error message from vee-validate or backend
   */
  error?: string | null

  /**
   * Mark field as required (UI only)
   */
  required?: boolean

  /**
   * Optional helper / hint text
   */
  hint?: string

  /**
   *  Disable Field
   */
  disabled?: boolean
}

export type DateLocaleCode = keyof typeof DATE_FNS_LOCALES
