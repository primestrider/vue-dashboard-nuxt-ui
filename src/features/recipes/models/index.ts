import type { SortOrder } from "@/shared/models/dummyjson"

export enum RecipesPageName {
  RECIPES_LIST = "RecipesList",
}

/** Meal types DummyJSON exposes through `/recipes/meal-type/:type`. */
export const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
  "Side Dish",
  "Appetizer",
  "Beverage",
] as const

export type MealType = (typeof MEAL_TYPES)[number]

/** Translation key under `features.recipes.meal_types` for each meal type. */
export const MEAL_TYPE_KEY = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
  Snack: "snack",
  Dessert: "dessert",
  "Side Dish": "side_dish",
  Appetizer: "appetizer",
  Beverage: "beverage",
} as const satisfies Record<MealType, string>

/** Recipe record returned by `GET /recipes/:id`. */
export type Recipe = {
  id: number
  name: string
  ingredients: string[]
  instructions: string[]
  prepTimeMinutes: number
  cookTimeMinutes: number
  servings: number
  difficulty: string
  cuisine: string
  caloriesPerServing: number
  tags: string[]
  userId: number
  image: string
  rating: number
  reviewCount: number
  mealType: string[]
}

/** Subset of recipe fields rendered by the recipe grid. */
export type RecipeListItem = Pick<
  Recipe,
  | "id"
  | "name"
  | "image"
  | "prepTimeMinutes"
  | "cookTimeMinutes"
  | "difficulty"
  | "cuisine"
  | "rating"
  | "reviewCount"
  | "mealType"
>

/**
 * Single browse filter. DummyJSON serves meal types and tags from separate
 * endpoints that cannot be combined, so only one applies at a time.
 */
export type RecipeBrowseFilter =
  | { kind: "all" }
  | { kind: "meal"; value: MealType }
  | { kind: "tag"; value: string }

export type RecipeSortField = "name" | "rating" | "cookTimeMinutes" | "caloriesPerServing"

export type RecipeListParams = {
  page: number
  limit: number
  /** Free-text search. Takes precedence over {@link RecipeListParams.filter}. */
  search: string
  filter: RecipeBrowseFilter
  sortBy: RecipeSortField
  order: SortOrder
}
