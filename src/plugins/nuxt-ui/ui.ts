import type { NuxtUIOptions } from "@nuxt/ui/vite"

/** Runtime app config — color mapping, icons, and per-component overrides. */
export type AppConfigUi = NonNullable<NuxtUIOptions["ui"]>

export const nuxtConfigUi = {
  colors: {
    primary: "emerald",
    neutral: "slate",
  },
} satisfies AppConfigUi
