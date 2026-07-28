export const getBrowserLocale = (supported: string[], fallback = "en"): string => {
  const [locale = fallback] = navigator.language.split("-")

  return supported.includes(locale) ? locale : fallback
}
