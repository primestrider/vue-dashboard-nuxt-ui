import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"
import { Permission } from "@/shared/models/access"

import type { ProductListItem } from "../models"
import * as api from "../services/api"
import ProductsListView from "../views/ProductsListView.vue"

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getProducts: vi.fn<(...args: unknown[]) => unknown>(),
  getProductCategories: vi.fn<(...args: unknown[]) => unknown>(),
  deleteProduct: vi.fn<(...args: unknown[]) => unknown>(),
}))

const product = (overrides: Partial<ProductListItem> = {}): ProductListItem => ({
  id: 1,
  title: "Essence Mascara",
  category: "beauty",
  price: 9.99,
  discountPercentage: 7,
  rating: 4.94,
  stock: 5,
  brand: "Essence",
  thumbnail: "",
  ...overrides,
})

const listResponse = (products: ProductListItem[], total = products.length) => ({
  products,
  total,
  skip: 0,
  limit: 10,
})

describe("ProductsListView", () => {
  beforeEach(() => {
    vi.mocked(api.getProductCategories).mockResolvedValue([
      { slug: "beauty", name: "Beauty", url: "" },
    ])
    vi.mocked(api.getProducts).mockResolvedValue(
      listResponse([product(), product({ id: 2, title: "Red Lipstick", stock: 0 })], 42),
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("renders product rows with category names, prices, and stock badges", async () => {
    const { wrapper } = await renderWithPlugins(ProductsListView)

    const text = wrapper.text()
    expect(text).toContain("Essence Mascara")
    expect(text).toContain("Beauty")
    expect(text).toContain("$9.99")
    expect(text).toContain("Low")
    expect(text).toContain("Sold out")
    expect(text).toContain("1–10 of 42")
  })

  it("searches through the API and returns to the first page", async () => {
    vi.useFakeTimers()
    const { wrapper } = await renderWithPlugins(ProductsListView)

    await wrapper.get('input[type="search"]').setValue("phone")
    await vi.advanceTimersByTimeAsync(350)
    vi.useRealTimers()
    await settle()

    expect(api.getProducts).toHaveBeenLastCalledWith(expect.objectContaining({ search: "phone", page: 1 }))
  })

  it("hides write actions without the products:write permission", async () => {
    const { wrapper } = await renderWithPlugins(ProductsListView, {
      permissions: [Permission.PRODUCTS_READ],
    })

    expect(wrapper.text()).not.toContain("Add product")
  })

  it("shows the add button to editors", async () => {
    const { wrapper } = await renderWithPlugins(ProductsListView)

    expect(wrapper.text()).toContain("Add product")
  })

  it("offers a retry when the list fails to load", async () => {
    vi.mocked(api.getProducts).mockRejectedValueOnce({ message: "Network Error" })
    const { wrapper } = await renderWithPlugins(ProductsListView)

    expect(wrapper.text()).toContain("Products didn't load")
    expect(wrapper.text()).toContain("Network Error")

    const retry = wrapper.findAll("button").find((button) => button.text() === "Try again")
    await retry?.trigger("click")
    await settle()

    expect(wrapper.text()).toContain("Essence Mascara")
  })

  describe("URL state", () => {
    it("restores filters, sort, and page from the URL", async () => {
      const { wrapper } = await renderWithPlugins(ProductsListView, {
        route: "/products/list?page=2&limit=20&q=phone&category=beauty&sort=price_desc",
      })

      expect(api.getProducts).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        search: "phone",
        category: "beauty",
        sortBy: "price",
        order: "desc",
      })
      expect((wrapper.get('input[type="search"]').element as HTMLInputElement).value).toBe("phone")
    })

    it("ignores tampered values and cleans them out of the URL", async () => {
      const { router } = await renderWithPlugins(ProductsListView, {
        route: "/products/list?page=-1&limit=1000&sort=hacked&category=not-a-category",
      })
      await settle()

      expect(api.getProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, limit: 10, category: "", sortBy: "title", order: "asc" }),
      )
      expect(router.currentRoute.value.query).toEqual({})
    })

    it("writes a new filter to the URL and returns to the first page", async () => {
      const { wrapper, router } = await renderWithPlugins(ProductsListView, { route: "/products/list?page=3" })

      await wrapper.get('button[aria-label="Page 2"]').trigger("click")
      await settle()
      expect(router.currentRoute.value.query).toEqual({ page: "2" })

      vi.useFakeTimers()
      await wrapper.get('input[type="search"]').setValue("lipstick")
      await vi.advanceTimersByTimeAsync(350)
      vi.useRealTimers()
      await settle()

      expect(router.currentRoute.value.query).toEqual({ q: "lipstick" })
    })

    it("moves a page past the end to the last page", async () => {
      const { router } = await renderWithPlugins(ProductsListView, { route: "/products/list?page=99" })
      await settle()

      expect(router.currentRoute.value.query).toEqual({ page: "5" })
    })
  })

  it("shows an empty state for a search with no results", async () => {
    vi.mocked(api.getProducts).mockResolvedValue(listResponse([]))
    const { wrapper } = await renderWithPlugins(ProductsListView)

    expect(wrapper.text()).toContain("No products match")
  })
})
