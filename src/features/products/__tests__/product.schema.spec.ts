import * as valibot from "valibot"
import { describe, expect, it } from "vitest"

import { productSchema, type ProductFormInput } from "../schemas/product.schema"

const validInput: ProductFormInput = {
  title: "  Desk lamp  ",
  description: " Warm light ",
  category: "home-decoration",
  brand: "",
  price: 19.99,
  discountPercentage: 12.5,
  stock: 4,
}

const issuesFor = (input: Partial<ProductFormInput>) => {
  const result = valibot.safeParse(productSchema, { ...validInput, ...input })
  return result.success ? [] : result.issues.map((issue) => issue.message)
}

describe("productSchema", () => {
  it("accepts a valid product and trims text fields", () => {
    const result = valibot.safeParse(productSchema, validInput)

    expect(result.success).toBe(true)
    expect(result.output).toMatchObject({ title: "Desk lamp", description: "Warm light" })
  })

  it("requires a title that isn't just whitespace", () => {
    expect(issuesFor({ title: "   " })).toContain("Title is required")
  })

  it("limits the title length", () => {
    expect(issuesFor({ title: "a".repeat(121) })).toContain("Title must be 120 characters or fewer")
  })

  it("requires a category", () => {
    expect(issuesFor({ category: "" })).toContain("Choose a category")
  })

  it("rejects a zero price", () => {
    expect(issuesFor({ price: 0 })).toContain("Price must be greater than 0")
  })

  it("keeps the discount between 0 and 100", () => {
    expect(issuesFor({ discountPercentage: -1 })).toContain("Discount can't be negative")
    expect(issuesFor({ discountPercentage: 101 })).toContain("Discount can't exceed 100%")
  })

  it("requires stock to be a non-negative whole number", () => {
    expect(issuesFor({ stock: 1.5 })).toContain("Stock must be a whole number")
    expect(issuesFor({ stock: -2 })).toContain("Stock can't be negative")
    expect(issuesFor({ stock: 0 })).toEqual([])
  })
})
