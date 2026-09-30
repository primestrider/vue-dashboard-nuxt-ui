import * as valibot from "valibot"

import { integerParam, literalParam, schemaParam, stringParam } from "@/shared/helpers/query-param"

import {
  DEFAULT_IMAGE_OPTIONS,
  HEX_COLOR_PATTERN,
  IMAGE_FONT_SIZE_RANGE,
  IMAGE_FONTS,
  IMAGE_FORMATS,
  IMAGE_MAX_SIZE,
  IMAGE_TEXT_MAX_LENGTH,
} from "../models"

/**
 * Hex color stored without `#` in the URL (`?bg=1e293b`) and with it in the app.
 */
const colorParam = (defaultValue: string) =>
  schemaParam(
    valibot.pipe(
      valibot.string(),
      valibot.regex(HEX_COLOR_PATTERN),
      valibot.transform((value) => `#${value.replace("#", "").toLowerCase()}`),
    ),
    defaultValue,
    (value) => value.replace("#", ""),
  )

/**
 * URL parameters for the image generator, so a configured image survives a
 * refresh and can be shared as a link.
 */
export const imageUrlParams = {
  w: integerParam({ default: DEFAULT_IMAGE_OPTIONS.width, min: 1, max: IMAGE_MAX_SIZE }),
  h: integerParam({ default: DEFAULT_IMAGE_OPTIONS.height, min: 1, max: IMAGE_MAX_SIZE }),
  bg: colorParam(DEFAULT_IMAGE_OPTIONS.background),
  fg: colorParam(DEFAULT_IMAGE_OPTIONS.foreground),
  text: stringParam({ maxLength: IMAGE_TEXT_MAX_LENGTH }),
  size: integerParam({ default: DEFAULT_IMAGE_OPTIONS.fontSize, ...IMAGE_FONT_SIZE_RANGE }),
  font: literalParam(IMAGE_FONTS, DEFAULT_IMAGE_OPTIONS.fontFamily),
  format: literalParam(IMAGE_FORMATS, DEFAULT_IMAGE_OPTIONS.format),
}
