import { createI18n } from "vue-i18n"

import { getBrowserLocale } from "./get-browser-locale"
import { languageMessages } from "./locales"

const defaultLocale = getBrowserLocale(["en", "id"], "en")

export type MessageLanguages = keyof typeof languageMessages

export type MessageSchema = (typeof languageMessages)["id"]

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: "en",
  messages: languageMessages,
})

type DotNotationKeys<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends string
    ? `${Prefix}${Extract<K, string>}`
    : DotNotationKeys<T[K], `${Prefix}${Extract<K, string>}.`>
}[keyof T]

export type TranslationKey = DotNotationKeys<MessageSchema>

export const translate = (key: TranslationKey) => i18n.global.t(key)

export const isTranslateExist = i18n.global.te
