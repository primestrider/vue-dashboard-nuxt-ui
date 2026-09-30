import { describe, expect, it } from "vitest"

import {
  integerParam,
  literalParam,
  paginationParams,
  resolveParam,
  serializeParam,
  slugParam,
  stringParam,
  withAllowList,
} from "../helpers/query-param"

describe("integerParam", () => {
  const page = integerParam({ default: 1, min: 1, max: 500 })

  it.each([
    ["3", 3],
    ["500", 500],
  ])("accepts %s", (raw, expected) => {
    expect(resolveParam(page, raw)).toEqual({ value: expected, valid: true })
  })

  it.each(["0", "-2", "501", "2.5", "abc", "1e3", "", " 2", "99999999999999999999"])("rejects %j", (raw) => {
    expect(resolveParam(page, raw)).toEqual({ value: 1, valid: false })
  })

  it("uses the default when the parameter is missing", () => {
    expect(resolveParam(page, undefined)).toEqual({ value: 1, valid: true })
  })
})

describe("literalParam", () => {
  const limit = literalParam([10, 20, 50], 10)
  const sort = literalParam(["name_asc", "price_desc"], "name_asc")

  it("accepts only listed values, keeping their type", () => {
    expect(resolveParam(limit, "20").value).toBe(20)
    expect(resolveParam(sort, "price_desc").value).toBe("price_desc")
  })

  it("rejects anything else", () => {
    expect(resolveParam(limit, "1000")).toEqual({ value: 10, valid: false })
    expect(resolveParam(sort, "price_desc; DROP TABLE")).toEqual({ value: "name_asc", valid: false })
  })
})

describe("stringParam", () => {
  it("trims and limits length", () => {
    const q = stringParam({ maxLength: 5 })

    expect(resolveParam(q, "  phone ").value).toBe("phone")
    expect(resolveParam(q, "iphone").valid).toBe(false)
  })

  it("applies a pattern to non-empty values", () => {
    const slug = slugParam()

    expect(resolveParam(slug, "mens-shirts").value).toBe("mens-shirts")
    expect(resolveParam(slug, "").valid).toBe(true)
    expect(resolveParam(slug, "Mens Shirts").valid).toBe(false)
    expect(resolveParam(slug, "../admin").valid).toBe(false)
  })
})

describe("withAllowList", () => {
  it("accepts well-formed values while the list is loading, then enforces it", () => {
    let allowed: string[] | undefined = undefined
    const category = withAllowList(slugParam(), () => allowed)

    expect(resolveParam(category, "beauty").valid).toBe(true)

    allowed = ["beauty", "laptops"]
    expect(resolveParam(category, "beauty").valid).toBe(true)
    expect(resolveParam(category, "made-up").valid).toBe(false)
  })

  it("always allows the default", () => {
    const category = withAllowList(slugParam(), () => [])

    expect(resolveParam(category, "").valid).toBe(true)
  })
})

describe("paginationParams", () => {
  it("defaults to page 1 and the first page size", () => {
    const { page, limit } = paginationParams([12, 24, 48])

    expect(page.default).toBe(1)
    expect(limit.default).toBe(12)
    expect(resolveParam(limit, "10").valid).toBe(false)
  })
})

describe("serializeParam", () => {
  it("uses a custom serializer when present", () => {
    expect(serializeParam(integerParam({ default: 1 }), 5)).toBe("5")
    expect(serializeParam({ default: "#000", parse: () => undefined, serialize: (value) => value.slice(1) }, "#fff")).toBe("fff")
  })
})
