import { describe, expect, it } from "vitest"

import { inventoryValueByCategory, lowStockProducts } from "../helpers/inventory"
import { toProductListItem } from "../helpers/list-cache"
import type { ProductListItem } from "../models"

const product = (overrides: Partial<ProductListItem>): ProductListItem => ({
  id: 1,
  title: "Item",
  category: "misc",
  price: 10,
  discountPercentage: 0,
  rating: 4,
  stock: 20,
  brand: "Acme",
  thumbnail: "thumb.webp",
  ...overrides,
})

describe("toProductListItem", () => {
  it("fills list defaults for a create response that echoes only the payload", () => {
    const item = toProductListItem({
      id: 195,
      title: "Desk lamp",
      description: "",
      category: "lighting",
      brand: "",
      price: 20,
      discountPercentage: 0,
      stock: 3,
    })

    expect(item).toMatchObject({ id: 195, rating: 0, thumbnail: "" })
  })
})

describe("inventoryValueByCategory", () => {
  const catalogue = [
    product({ id: 1, category: "phones", price: 500, stock: 2 }),
    product({ id: 2, category: "phones", price: 100.1, stock: 3 }),
    product({ id: 3, category: "books", price: 5, stock: 100 }),
    product({ id: 4, category: "toys", price: 1, stock: 1 }),
  ]

  it("sums price × stock per category, largest first", () => {
    expect(inventoryValueByCategory(catalogue)).toEqual([
      { category: "phones", value: 1300.3, units: 5, products: 2 },
      { category: "books", value: 500, units: 100, products: 1 },
      { category: "toys", value: 1, units: 1, products: 1 },
    ])
  })

  it("returns at most `limit` categories", () => {
    expect(inventoryValueByCategory(catalogue, 2).map((entry) => entry.category)).toEqual(["phones", "books"])
  })

  it("returns nothing for an empty catalogue", () => {
    expect(inventoryValueByCategory([])).toEqual([])
  })
})

describe("lowStockProducts", () => {
  it("keeps products at or under the threshold, emptiest first", () => {
    const catalogue = [
      product({ id: 1, title: "B", stock: 10 }),
      product({ id: 2, title: "A", stock: 10 }),
      product({ id: 3, stock: 0 }),
      product({ id: 4, stock: 11 }),
    ]

    expect(lowStockProducts(catalogue).map((item) => item.id)).toEqual([3, 2, 1])
    expect(lowStockProducts(catalogue, 1).map((item) => item.id)).toEqual([3])
    expect(lowStockProducts(catalogue, Infinity, 5).map((item) => item.id)).toEqual([3])
  })
})
