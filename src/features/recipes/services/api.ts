/**
 * Recipes API client backed by DummyJSON.
 */

import type { DummyJsonList } from "@/shared/models/dummyjson"
import { pageToSkip, requestDummyJson } from "@/shared/services/dummyjson"

import type { Recipe, RecipeListItem, RecipeListParams } from "../models"

export type RecipeListResponse = DummyJsonList<"recipes", RecipeListItem>

/** Fields requested for grid cards, keeping the payload small. */
const LIST_FIELDS = "name,image,prepTimeMinutes,cookTimeMinutes,difficulty,cuisine,rating,reviewCount,mealType"

/** TanStack Query keys for the recipes feature. */
export const recipeQueryKeys = {
  all: ["recipes"] as const,
  list: (params: RecipeListParams) => [...recipeQueryKeys.all, "list", params] as const,
  detail: (id: number) => [...recipeQueryKeys.all, "detail", id] as const,
  tags: () => [...recipeQueryKeys.all, "tags"] as const,
}

/**
 * Resolves which DummyJSON endpoint serves a list request.
 *
 * @remarks
 * Search wins over the browse filter because DummyJSON cannot combine them.
 */
export const resolveRecipeListUrl = ({
  search,
  filter,
}: Pick<RecipeListParams, "search" | "filter">): { url: string; params: { q?: string } } => {
  const query = search.trim()

  if (query) {
    return { url: "/recipes/search", params: { q: query } }
  }

  if (filter.kind === "meal") {
    return { url: `/recipes/meal-type/${encodeURIComponent(filter.value.toLowerCase())}`, params: {} }
  }

  if (filter.kind === "tag") {
    return { url: `/recipes/tag/${encodeURIComponent(filter.value)}`, params: {} }
  }

  return { url: "/recipes", params: {} }
}

/**
 * Fetches one page of recipes.
 *
 * @param params - Pagination, filter, and sort state from the list view.
 */
export const getRecipes = (params: RecipeListParams): Promise<RecipeListResponse> => {
  const { url, params: filterParams } = resolveRecipeListUrl(params)

  return requestDummyJson<RecipeListResponse>({
    url,
    method: "GET",
    params: {
      ...filterParams,
      limit: params.limit,
      skip: pageToSkip(params.page, params.limit),
      select: LIST_FIELDS,
      sortBy: params.sortBy,
      order: params.order,
    },
  })
}

/** Fetches a single recipe with ingredients and instructions. */
export const getRecipe = (id: number): Promise<Recipe> =>
  requestDummyJson<Recipe>({ url: `/recipes/${id}`, method: "GET" })

/** Fetches every recipe tag. */
export const getRecipeTags = (): Promise<string[]> =>
  requestDummyJson<string[]>({ url: "/recipes/tags", method: "GET" })
