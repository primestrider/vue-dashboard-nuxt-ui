import type { DATE_FNS_LOCALES } from "../helpers/date";

export enum UtilsPageName {
  PAGE_NOT_FOUND = "PageNotFound",
  FORBIDDEN = "Forbidden",
}

export type DateLocaleCode = keyof typeof DATE_FNS_LOCALES;
