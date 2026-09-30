import { beforeEach, describe, expect, it, vi } from "vitest"

import { resolveParam } from "@/shared/helpers/query-param"
import { requestDummyJson } from "@/shared/services/dummyjson"

import { browseFilterParam, decodeBrowseFilter, encodeBrowseFilter } from "../helpers/browse-filter"
import { getRecipes, resolveRecipeListUrl } from "../services/api"

vi.mock("@/shared/services/dummyjson", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/services/dummyjson")>()),
  requestDummyJson: vi.fn<typeof requestDummyJson>().mockResolvedValue({}),
}))

const request = vi.mocked(requestDummyJson)

describe("browse filter encoding", () => {
  it.each([
    [{ kind: "all" } as const, ""],
    [{ kind: "meal", value: "Side Dish" } as const, "meal:Side Dish"],
    [{ kind: "tag", value: "Pizza" } as const, "tag:Pizza"],
  ])("round-trips %o", (filter, encoded) => {
    expect(encodeBrowseFilter(filter)).toBe(encoded)
    expect(decodeBrowseFilter(encoded)).toEqual(filter)
  })

  it("falls back to all recipes for unknown values", () => {
    expect(decodeBrowseFilter("meal:Brunch")).toEqual({ kind: "all" })
    expect(decodeBrowseFilter("tag:")).toEqual({ kind: "all" })
    expect(decodeBrowseFilter("nonsense")).toEqual({ kind: "all" })
  })
})

describe("browseFilterParam", () => {
  it("accepts meal types immediately and tags once they're known", () => {
    let tags: string[] | undefined = undefined
    const param = browseFilterParam(() => tags)

    expect(resolveParam(param, "meal:Dinner").valid).toBe(true)
    expect(resolveParam(param, "tag:Pizza").valid).toBe(true)

    tags = ["Pizza"]
    expect(resolveParam(param, "tag:Pizza").valid).toBe(true)
    expect(resolveParam(param, "tag:Sushi").valid).toBe(false)
  })

  it("rejects malformed values", () => {
    const param = browseFilterParam(() => undefined)

    expect(resolveParam(param, "meal:Brunch").valid).toBe(false)
    expect(resolveParam(param, "dessert").valid).toBe(false)
    expect(resolveParam(param, `tag:${"x".repeat(80)}`).valid).toBe(false)
  })
})

describe("resolveRecipeListUrl", () => {
  it("lists every recipe without filters", () => {
    expect(resolveRecipeListUrl({ search: "", filter: { kind: "all" } })).toEqual({ url: "/recipes", params: {} })
  })

  it("uses the lowercase, encoded meal type", () => {
    expect(resolveRecipeListUrl({ search: "", filter: { kind: "meal", value: "Side Dish" } }).url).toBe(
      "/recipes/meal-type/side%20dish",
    )
  })

  it("filters by tag", () => {
    expect(resolveRecipeListUrl({ search: "", filter: { kind: "tag", value: "Main course" } }).url).toBe(
      "/recipes/tag/Main%20course",
    )
  })

  it("lets a trimmed search win over the browse filter", () => {
    expect(resolveRecipeListUrl({ search: " pasta ", filter: { kind: "tag", value: "Pizza" } })).toEqual({
      url: "/recipes/search",
      params: { q: "pasta" },
    })
  })
})

describe("getRecipes", () => {
  beforeEach(() => {
    request.mockClear()
  })

  it("requests the selected page with sorting", async () => {
    await getRecipes({ page: 2, limit: 12, search: "", filter: { kind: "all" }, sortBy: "rating", order: "desc" })

    expect(request).toHaveBeenCalledWith({
      url: "/recipes",
      method: "GET",
      params: expect.objectContaining({ limit: 12, skip: 12, sortBy: "rating", order: "desc" }),
    })
  })
})
