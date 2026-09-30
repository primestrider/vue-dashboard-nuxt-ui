import { customersNavigation } from "@/features/customers/navigation"
import { dashboardNavigation } from "@/features/dashboard/navigation"
import { imageGeneratorNavigation } from "@/features/image-generator/navigation"
import { ordersNavigation } from "@/features/orders/navigation"
import { postsNavigation } from "@/features/posts/navigation"
import { productsNavigation } from "@/features/products/navigation"
import { recipesNavigation } from "@/features/recipes/navigation"
import { transactionsNavigation } from "@/features/transactions/navigation"
import { usersNavigation } from "@/features/users/navigation"

import type { SidebarNavGroup } from "./types"

/**
 * Central sidebar registry.
 *
 * @remarks
 * Each feature owns its own `navigation.ts` file.
 * This registry only aggregates those exports into renderable groups.
 *
 * When adding a new feature:
 * 1. Create `features/<feature>/navigation.ts`
 * 2. Import it here
 * 3. Append the exported items to the appropriate group
 *
 * @example
 * ```ts
 * import { reportsNavigation } from "@/features/reports/navigation"
 *
 * export const sidebarNavigationGroups = [
 *   // ...
 *   {
 *     id: "reports",
 *     items: [...reportsNavigation],
 *   },
 * ]
 * ```
 */
export const sidebarNavigationGroups: SidebarNavGroup[] = [
  {
    id: "main",
    items: [...dashboardNavigation],
  },
  {
    id: "management",
    items: [
      { type: "label", label: "Management" },
      ...ordersNavigation,
      ...productsNavigation,
      ...customersNavigation,
      ...transactionsNavigation,
    ],
  },
  {
    id: "content",
    items: [{ type: "label", label: "Content" }, ...recipesNavigation, ...postsNavigation],
  },
  {
    id: "administration",
    items: [{ type: "label", label: "Administration" }, ...usersNavigation],
  },
  {
    id: "tools",
    items: [{ type: "label", label: "Tools" }, ...imageGeneratorNavigation],
  },
]
