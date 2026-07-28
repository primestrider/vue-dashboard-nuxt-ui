import { computed } from "vue"
import { useI18n } from "vue-i18n"

import {
  formatDate,
  formatDateTime,
  formatTimeStampRelative,
  isSupportedDateLocale,
} from "@/shared/helpers/date"

import type { DateLocaleCode } from "../models"

export const useDateFormatter = () => {
  const { locale } = useI18n()

  const resolvedLocale = computed<DateLocaleCode>(() => {
    const rawLocale = locale.value || "en"
    const [baseLocale = "en"] = rawLocale.split("-")

    if (isSupportedDateLocale(baseLocale)) {
      return baseLocale
    }

    return "en"
  })

  /**
   * Format date into readable string
   */
  const formatDateWithLocale = (date: string | Date, pattern?: string) => {
    return formatDate(date, resolvedLocale.value, pattern)
  }

  /**
   * Format date with time
   */
  const formatDateTimeWithLocale = (date: string | Date, pattern?: string) => {
    return formatDateTime(date, resolvedLocale.value, pattern)
  }

  /**
   * Format relative time
   */
  const formatRelativeTimeWithLocale = (date: string | Date) => {
    return formatTimeStampRelative(date, resolvedLocale.value)
  }

  return {
    formatDate: formatDateWithLocale,
    formatDateTime: formatDateTimeWithLocale,
    formatRelativeTime: formatRelativeTimeWithLocale,
  }
}
