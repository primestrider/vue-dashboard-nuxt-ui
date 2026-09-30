import { describe, expect, it } from "vitest"

import { buildImageUrl, clampDimension, imageFileName, toHexSegment } from "../helpers/image-url"
import { DEFAULT_IMAGE_OPTIONS, IMAGE_MAX_SIZE } from "../models"

describe("buildImageUrl", () => {
  it("encodes size, colors, and options in DummyJSON's format", () => {
    const url = buildImageUrl({
      ...DEFAULT_IMAGE_OPTIONS,
      width: 400,
      height: 200,
      background: "#008080",
      foreground: "#FFFFFF",
      text: "Hello Peter",
      fontSize: 16,
      fontFamily: "pacifico",
      format: "webp",
    })

    expect(url).toBe(
      "https://dummyjson.com/image/400x200/008080/ffffff?text=Hello+Peter&fontSize=16&fontFamily=pacifico&type=webp",
    )
  })

  it("omits blank text so DummyJSON shows the dimensions", () => {
    expect(buildImageUrl({ ...DEFAULT_IMAGE_OPTIONS, text: "   " })).not.toContain("text=")
  })

  it("escapes characters that would break the query string", () => {
    expect(buildImageUrl({ ...DEFAULT_IMAGE_OPTIONS, text: "A&B=C" })).toContain("text=A%26B%3DC")
  })

  it("falls back to default colors for invalid hex values", () => {
    const url = buildImageUrl({ ...DEFAULT_IMAGE_OPTIONS, background: "teal", foreground: "#12" })

    expect(url).toContain("/1e293b/f1f5f9?")
  })
})

describe("toHexSegment", () => {
  it("accepts 3- and 6-digit hex with or without #", () => {
    expect(toHexSegment("#ABC", "000")).toBe("abc")
    expect(toHexSegment(" 00ff00 ", "000")).toBe("00ff00")
  })
})

describe("clampDimension", () => {
  it.each([
    [0, 1],
    [-50, 1],
    [120.6, 121],
    [IMAGE_MAX_SIZE + 1, IMAGE_MAX_SIZE],
    [Number.NaN, 1],
  ])("clamps %d to %d", (input, expected) => {
    expect(clampDimension(input)).toBe(expected)
  })
})

describe("imageFileName", () => {
  it("names the file after its size and format", () => {
    expect(imageFileName({ ...DEFAULT_IMAGE_OPTIONS, width: 256, height: 256, format: "jpg" })).toBe(
      "placeholder-256x256.jpg",
    )
  })
})
