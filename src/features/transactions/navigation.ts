import { Permission } from "@/shared/models/access"
import type { SidebarNavItem } from "@/shared/navigation/types"

import { TransactionsPageName } from "./models"

/**
 * Sidebar entries owned by the transactions feature.
 *
 * @remarks
 * Keep labels, icons, route names, and permissions aligned with
 * `features/transactions/routes.ts`.
 */
export const transactionsNavigation: SidebarNavItem[] = [
  {
    label: "Transactions",
    icon: "i-lucide-credit-card",
    to: { name: TransactionsPageName.TRANSACTIONS_LIST },
    permissions: [Permission.TRANSACTIONS_READ],
  },
]
