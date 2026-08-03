import type { DATE_FNS_LOCALES } from "../helpers/date"

/**
 * Named routes for shared utility pages.
 */
export enum UtilsPageName {
  PAGE_NOT_FOUND = "PageNotFound",
  FORBIDDEN = "Forbidden",
}

/** Supported date-fns locale codes aligned with vue-i18n locale keys. */
export type DateLocaleCode = keyof typeof DATE_FNS_LOCALES

/**
 * Props for {@link BaseFormField}.
 *
 * @remarks
 * This component handles layout and accessibility only.
 * Validation state must be supplied by the parent form.
 */
export type BaseFormFieldProps = {
  /** Visible label text. An invisible placeholder reserves height when empty. */
  label?: string
  /** Value for the `for` attribute and `aria-*` ID generation. */
  fieldName?: string
  /** Validation or server error message. Hidden when the field is disabled. */
  error?: string | null
  /** Shows a required asterisk next to the label. */
  required?: boolean
  /** Helper text shown when no error is present. */
  hint?: string
  /** Disables error display and dims the label. */
  disabled?: boolean
}
