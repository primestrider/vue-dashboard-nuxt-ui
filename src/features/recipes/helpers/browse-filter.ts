import { type QueryParam, withAllowList } from "@/shared/helpers/query-param"

import { MEAL_TYPES, type MealType, type RecipeBrowseFilter } from "../models"

const MEAL_PREFIX = "meal:"
const TAG_PREFIX = "tag:"

/** Serializes a browse filter into a select-menu value. */
export const encodeBrowseFilter = (filter: RecipeBrowseFilter): string => {
  if (filter.kind === "meal") return `${MEAL_PREFIX}${filter.value}`
  if (filter.kind === "tag") return `${TAG_PREFIX}${filter.value}`
  return ""
}

const isMealType = (value: string): value is MealType => (MEAL_TYPES as readonly string[]).includes(value)

/**
 * Parses a select-menu value back into a browse filter.
 *
 * @remarks
 * Unknown or malformed values fall back to `{ kind: "all" }`.
 */
export const decodeBrowseFilter = (value: string): RecipeBrowseFilter => {
  if (value.startsWith(MEAL_PREFIX)) {
    const meal = value.slice(MEAL_PREFIX.length)
    return isMealType(meal) ? { kind: "meal", value: meal } : { kind: "all" }
  }

  if (value.startsWith(TAG_PREFIX) && value.length > TAG_PREFIX.length) {
    return { kind: "tag", value: value.slice(TAG_PREFIX.length) }
  }

  return { kind: "all" }
}

/**
 * URL parameter for the browse filter.
 *
 * @remarks
 * Meal types are validated against the fixed list right away; tags are checked
 * once the tag list has loaded.
 *
 * @param getTags - Returns known recipe tags, or `undefined` while loading.
 */
export const browseFilterParam = (getTags: () => readonly string[] | undefined): QueryParam<string> =>
  withAllowList<string>(
    {
      default: "",
      parse: (raw) => (raw.length <= 60 && decodeBrowseFilter(raw).kind !== "all" ? raw : undefined),
    },
    () => {
      const tags = getTags()
      if (!tags) return undefined

      return [
        ...MEAL_TYPES.map((meal) => encodeBrowseFilter({ kind: "meal", value: meal })),
        ...tags.map((tag) => encodeBrowseFilter({ kind: "tag", value: tag })),
      ]
    },
  )
