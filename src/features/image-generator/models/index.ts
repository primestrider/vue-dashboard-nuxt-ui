export enum ImageGeneratorPageName {
  IMAGE_GENERATOR = "ImageGenerator",
}

/** Font families supported by the DummyJSON image endpoint. */
export const IMAGE_FONTS = [
  "bitter",
  "cairo",
  "comfortaa",
  "cookie",
  "dosis",
  "gotham",
  "lobster",
  "marhey",
  "pacifico",
  "poppins",
  "quicksand",
  "qwigley",
  "satisfy",
  "ubuntu",
] as const

export type ImageFont = (typeof IMAGE_FONTS)[number]

export const IMAGE_FORMATS = ["png", "jpg", "webp"] as const

export type ImageFormat = (typeof IMAGE_FORMATS)[number]

/** 3- or 6-digit hex color, with or without `#`. */
export const HEX_COLOR_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/** Longest text DummyJSON renders legibly; also the input's `maxlength`. */
export const IMAGE_TEXT_MAX_LENGTH = 60

export const IMAGE_FONT_SIZE_RANGE = { min: 8, max: 200 } as const

/** Largest edge DummyJSON renders; bigger requests fail with a server error. */
export const IMAGE_MAX_SIZE = 4000

/** Options for a DummyJSON placeholder image. */
export type ImageOptions = {
  width: number
  height: number
  /** Hex color, with or without `#`. */
  background: string
  /** Hex color, with or without `#`. */
  foreground: string
  /** Label drawn on the image. Empty shows the dimensions. */
  text: string
  fontSize: number
  fontFamily: ImageFont
  format: ImageFormat
}

export const DEFAULT_IMAGE_OPTIONS: ImageOptions = {
  width: 1200,
  height: 630,
  background: "#1e293b",
  foreground: "#f1f5f9",
  text: "",
  fontSize: 64,
  fontFamily: "poppins",
  format: "png",
}

/** Common sizes offered as one-click presets. */
export const IMAGE_PRESETS = [
  { key: "avatar", width: 256, height: 256 },
  { key: "thumbnail", width: 400, height: 300 },
  { key: "banner", width: 1500, height: 500 },
  { key: "social", width: 1200, height: 630 },
] as const
