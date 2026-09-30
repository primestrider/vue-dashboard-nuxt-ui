import { describe, expect, it } from "vitest"

import { getApiErrorMessage } from "../helpers/error"
import { formatCurrency, formatNumber } from "../helpers/number"

describe("getApiErrorMessage", () => {
  it("prefers the server message from the response body", () => {
    const error = { message: "Request failed with status code 404", status: 404, data: { message: "Product with id '999' not found" } }

    expect(getApiErrorMessage(error)).toBe("Product with id '999' not found")
  })

  it("falls back to the transport message when the body has none", () => {
    expect(getApiErrorMessage({ message: "Network Error" })).toBe("Network Error")
    expect(getApiErrorMessage({ message: "timeout", data: "<html>" })).toBe("timeout")
  })

  it("uses the fallback for values that are not API errors", () => {
    expect(getApiErrorMessage(undefined)).toBe("Something went wrong.")
    expect(getApiErrorMessage("boom", "Try later")).toBe("Try later")
    expect(getApiErrorMessage({ message: "" }, "Try later")).toBe("Try later")
  })
})

describe("number formatting", () => {
  it("formats USD with cents and grouping", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50")
    expect(formatCurrency(0)).toBe("$0.00")
  })

  it("formats counts without fractions by default", () => {
    expect(formatNumber(12345.67)).toBe("12,346")
    expect(formatNumber(1.256, "en-US", 2)).toBe("1.26")
  })
})
