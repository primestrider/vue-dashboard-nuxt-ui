import { DUMMYJSON_BASE_URL } from "@/shared/services/dummyjson"

import { DEFAULT_IMAGE_OPTIONS, IMAGE_MAX_SIZE, type ImageOptions } from "../models"

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Normalizes a hex color for the URL path (lowercase, no `#`).
 *
 * @param value - User-entered color.
 * @param fallback - Color used when `value` isn't a 3- or 6-digit hex.
 */
export const toHexSegment = (value: string, fallback: string): string => {
  const match = HEX_COLOR.exec(value.trim()) ?? HEX_COLOR.exec(fallback)
  return (match?.[1] ?? "000000").toLowerCase()
}

/** Clamps a dimension to a whole number DummyJSON can render. */
export const clampDimension = (value: number): number =>
  Number.isFinite(value) ? Math.min(Math.max(Math.round(value), 1), IMAGE_MAX_SIZE) : 1

/**
 * Builds a DummyJSON dynamic image URL.
 *
 * @example
 * buildImageUrl({ ...DEFAULT_IMAGE_OPTIONS, width: 400, height: 200, text: "Hello" })
 * // "https://dummyjson.com/image/400x200/1e293b/f1f5f9?text=Hello&fontSize=64&fontFamily=poppins&type=png"
 *
 * @see https://dummyjson.com/docs/image
 */
export const buildImageUrl = (options: ImageOptions): string => {
  const size = `${clampDimension(options.width)}x${clampDimension(options.height)}`
  const background = toHexSegment(options.background, DEFAULT_IMAGE_OPTIONS.background)
  const foreground = toHexSegment(options.foreground, DEFAULT_IMAGE_OPTIONS.foreground)

  const query = new URLSearchParams()
  const text = options.text.trim()
  if (text) query.set("text", text)
  query.set("fontSize", String(Math.max(Math.round(options.fontSize), 1)))
  query.set("fontFamily", options.fontFamily)
  query.set("type", options.format)

  return `${DUMMYJSON_BASE_URL}/image/${size}/${background}/${foreground}?${query.toString()}`
}

/** File name suggested when downloading a generated image. */
export const imageFileName = (options: ImageOptions): string =>
  `placeholder-${clampDimension(options.width)}x${clampDimension(options.height)}.${options.format}`
