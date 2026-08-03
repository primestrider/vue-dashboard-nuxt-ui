import { Permission } from "@/shared/models/access"
import type { SidebarNavItem } from "@/shared/navigation/types"

import { OrdersPageName } from "./models"

/**
 * Sidebar entries owned by the orders feature.
 *
 * @remarks
 * Keep labels, icons, route names, and permissions aligned with
 * `features/orders/routes.ts`.
 */
export const ordersNavigation: SidebarNavItem[] = [
  {
    label: "Orders",
    icon: "i-lucide-shopping-cart",
    to: { name: OrdersPageName.ORDERS_LIST },
    permissions: [Permission.ORDERS_READ],
  },
]
