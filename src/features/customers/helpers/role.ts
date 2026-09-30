import type { BadgeProps } from "@nuxt/ui"

import type { CustomerRole } from "../models"

/** Badge color per customer role, so elevated roles stand out in lists. */
export const ROLE_BADGE_COLOR: Record<CustomerRole, NonNullable<BadgeProps["color"]>> = {
  admin: "primary",
  moderator: "info",
  user: "neutral",
}
