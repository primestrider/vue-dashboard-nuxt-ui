import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"
import type { Locale } from "date-fns"
import { enUS, id } from "date-fns/locale"

import type { DateLocaleCode } from "../models"

/**
 * Map i18n locale -> date-fns locale
 *
 * IMPORTANT:
 * - Key harus sama dengan locale code di vue-i18n
 */
export const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  id,
}

/**
 * Normalize input into a valid Date object.
 * Returns null if date is invalid.
 */
const toDate = (date: string | Date): Date | null => {
  const parsed = typeof date === "string" ? parseISO(date) : date
  return isValid(parsed) ? parsed : null
}

/**
 * Safely format date with locale support.
 */
const formatSafe = (date: string | Date, pattern: string, locale: Locale): string => {
  const parsed = toDate(date)
  if (!parsed) return "-"

  return format(parsed, pattern, { locale })
}

/**
 * Format date into readable string.
 * Example: "21 Jan 2025"
 */
export const formatDate = (
  date: string | Date,
  localeCode: DateLocaleCode = "en",
  pattern = "dd MMM yyyy",
): string => {
  const locale = DATE_FNS_LOCALES[localeCode] ?? enUS
  return formatSafe(date, pattern, locale)
}

/**
 * Format date with time.
 * Example: "21 Jan 2025, 14:30"
 */
export const formatDateTime = (
  date: string | Date,
  localeCode: DateLocaleCode = "en",
  pattern = "dd MMM yyyy, HH:mm",
): string => {
  const locale = DATE_FNS_LOCALES[localeCode] ?? enUS
  return formatSafe(date, pattern, locale)
}

/**
 * Format relative time.
 * Example: "5 minutes ago"
 * ⚠️ Do NOT use for date-only strings (YYYY-MM-DD),
 * as timezone differences may cause incorrect results.
 */
export const formatTimeStampRelative = (
  date: string | Date,
  localeCode: DateLocaleCode = "en",
): string => {
  const parsed = toDate(date)
  if (!parsed) return "-"

  const locale = DATE_FNS_LOCALES[localeCode] ?? enUS

  return formatDistanceToNow(parsed, {
    addSuffix: true,
    locale,
  })
}

export const isSupportedDateLocale = (locale: string): locale is DateLocaleCode =>
  locale in DATE_FNS_LOCALES
