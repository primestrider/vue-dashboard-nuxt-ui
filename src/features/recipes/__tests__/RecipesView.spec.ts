import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"

import RecipeDetailModal from "../components/RecipeDetailModal.vue"
import type { Recipe, RecipeListItem } from "../models"
import * as api from "../services/api"
import RecipesListView from "../views/RecipesListView.vue"

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getRecipes: vi.fn<(...args: unknown[]) => unknown>(),
  getRecipe: vi.fn<(...args: unknown[]) => unknown>(),
  getRecipeTags: vi.fn<(...args: unknown[]) => unknown>(),
}))

const recipe: RecipeListItem = {
  id: 1,
  name: "Classic Margherita Pizza",
  image: "",
  prepTimeMinutes: 20,
  cookTimeMinutes: 15,
  difficulty: "Easy",
  cuisine: "Italian",
  rating: 4.6,
  reviewCount: 98,
  mealType: ["Dinner"],
}

afterEach(() => {
  vi.clearAllMocks()
})

describe("RecipesListView", () => {
  beforeEach(() => {
    vi.mocked(api.getRecipeTags).mockResolvedValue(["Pizza", "Italian"])
    vi.mocked(api.getRecipes).mockResolvedValue({ recipes: [recipe], total: 50, skip: 0, limit: 12 })
  })

  it("renders recipe cards with total time, rating, and difficulty", async () => {
    const { wrapper } = await renderWithPlugins(RecipesListView)

    const card = wrapper.get("ul > li button")
    expect(card.text()).toContain("Classic Margherita Pizza")
    expect(card.text()).toContain("35 min")
    expect(card.text()).toContain("4.6")
    expect(card.text()).toContain("98 reviews")
    expect(card.text()).toContain("Easy")
  })

  it("asks for 12 recipes per page, highest rated first", async () => {
    await renderWithPlugins(RecipesListView)

    expect(api.getRecipes).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 12, sortBy: "rating", order: "desc", filter: { kind: "all" } }),
    )
  })

  it("opens the recipe detail from a card", async () => {
    vi.mocked(api.getRecipe).mockResolvedValue({
      ...recipe,
      ingredients: ["Dough"],
      instructions: ["Bake"],
      servings: 4,
      caloriesPerServing: 300,
      tags: [],
      userId: 1,
    })
    const { wrapper, screen } = await renderWithPlugins(RecipesListView)

    await wrapper.get("ul > li button").trigger("click")
    await settle()

    expect(api.getRecipe).toHaveBeenCalledWith(1)
    expect(screen.get('[role="dialog"]').text()).toContain("Method")
  })

  it("shows an empty state when nothing matches", async () => {
    vi.mocked(api.getRecipes).mockResolvedValue({ recipes: [], total: 0, skip: 0, limit: 12 })
    const { wrapper } = await renderWithPlugins(RecipesListView)

    expect(wrapper.text()).toContain("No recipes match")
  })
})

describe("RecipeDetailModal", () => {
  const fullRecipe: Recipe = {
    ...recipe,
    ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella"],
    instructions: ["Preheat the oven.", "Spread the sauce.", "Bake for 15 minutes."],
    servings: 4,
    caloriesPerServing: 300,
    tags: ["Pizza"],
    userId: 166,
  }

  beforeEach(() => {
    vi.mocked(api.getRecipe).mockResolvedValue(fullRecipe)
  })

  it("lists facts, ingredients, and numbered steps", async () => {
    const { screen } = await renderWithPlugins(RecipeDetailModal, { props: { open: true, recipeId: 1 } })

    const dialog = screen.get('[role="dialog"]')
    expect(dialog.text()).toContain("Classic Margherita Pizza")
    expect(dialog.text()).toContain("300 kcal")
    expect(dialog.text()).toContain("Tomato sauce")
    expect(dialog.findAll("ol > li")).toHaveLength(3)
    expect(dialog.get('ol > li [aria-label="Step 2"]').text()).toBe("2")
  })

  it("tracks ingredients as they're ticked", async () => {
    const { screen } = await renderWithPlugins(RecipeDetailModal, { props: { open: true, recipeId: 1 } })

    expect(screen.text()).toContain("0 of 3 ready")

    await screen.findAll('[role="checkbox"]')[1]?.trigger("click")
    await settle()

    expect(screen.text()).toContain("1 of 3 ready")
  })
})
