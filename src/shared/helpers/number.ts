/**
 * Formats a number as currency.
 *
 * @param value - Amount to format.
 * @param locale - BCP 47 locale. Defaults to `"en-US"`.
 * @param currency - ISO 4217 code. Defaults to `"USD"`, the currency DummyJSON prices use.
 *
 * @example
 * formatCurrency(1234.5) // "$1,234.50"
 */
export const formatCurrency = (value: number, locale = "en-US", currency = "USD"): string =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(value)

/**
 * Formats a number with grouping separators.
 *
 * @param value - Number to format.
 * @param locale - BCP 47 locale. Defaults to `"en-US"`.
 * @param maximumFractionDigits - Defaults to `0`.
 */
export const formatNumber = (value: number, locale = "en-US", maximumFractionDigits = 0): string =>
  new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value)
