import { customersNavigation } from "@/features/customers/navigation"
import { dashboardNavigation } from "@/features/dashboard/navigation"
import { ordersNavigation } from "@/features/orders/navigation"
import { transactionsNavigation } from "@/features/transactions/navigation"

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
      ...customersNavigation,
      ...transactionsNavigation,
    ],
  },
]
