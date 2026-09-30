import { beforeEach, describe, expect, it, vi } from "vitest"

import { requestDummyJson } from "@/shared/services/dummyjson"

import type { ProductListParams } from "../models"
import { createProduct, deleteProduct, getProducts, resolveProductListUrl, updateProduct } from "../services/api"

vi.mock("@/shared/services/dummyjson", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/services/dummyjson")>()),
  requestDummyJson: vi.fn<typeof requestDummyJson>().mockResolvedValue({}),
}))

const request = vi.mocked(requestDummyJson)

const baseParams: ProductListParams = {
  page: 1,
  limit: 10,
  search: "",
  category: "",
  sortBy: "title",
  order: "asc",
}

const payload = {
  title: "Desk lamp",
  description: "",
  category: "home-decoration",
  brand: "",
  price: 19.99,
  discountPercentage: 0,
  stock: 4,
}

describe("resolveProductListUrl", () => {
  it("lists every product when no filter is set", () => {
    expect(resolveProductListUrl({ search: "", category: "" })).toEqual({ url: "/products", params: {} })
  })

  it("filters by category", () => {
    expect(resolveProductListUrl({ search: "", category: "mens-shirts" })).toEqual({
      url: "/products/category/mens-shirts",
      params: {},
    })
  })

  it("lets a trimmed search win over the category filter", () => {
    expect(resolveProductListUrl({ search: "  phone ", category: "laptops" })).toEqual({
      url: "/products/search",
      params: { q: "phone" },
    })
  })

  it("ignores whitespace-only searches", () => {
    expect(resolveProductListUrl({ search: "   ", category: "" }).url).toBe("/products")
  })
})

describe("products service", () => {
  beforeEach(() => {
    request.mockClear()
  })

  it("requests the selected page with sorting and a trimmed field list", async () => {
    await getProducts({ ...baseParams, page: 3, limit: 20, sortBy: "price", order: "desc" })

    expect(request).toHaveBeenCalledWith({
      url: "/products",
      method: "GET",
      params: expect.objectContaining({ limit: 20, skip: 40, sortBy: "price", order: "desc" }),
    })
    expect(request.mock.calls[0]?.[0].params.select).toContain("thumbnail")
  })

  it("sends the search term as `q`", async () => {
    await getProducts({ ...baseParams, search: "mascara" })

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/products/search", params: expect.objectContaining({ q: "mascara" }) }),
    )
  })

  it("maps writes to the DummyJSON endpoints", async () => {
    await createProduct(payload)
    await updateProduct({ id: 7, payload })
    await deleteProduct(7)

    expect(request).toHaveBeenNthCalledWith(1, { url: "/products/add", method: "POST", data: payload })
    expect(request).toHaveBeenNthCalledWith(2, { url: "/products/7", method: "PUT", data: payload })
    expect(request).toHaveBeenNthCalledWith(3, { url: "/products/7", method: "DELETE" })
  })
})
