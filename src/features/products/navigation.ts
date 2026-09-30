import { Permission } from "@/shared/models/access"
import type { SidebarNavItem } from "@/shared/navigation/types"

import { ProductsPageName } from "./models"

/**
 * Sidebar entries owned by the products feature.
 *
 * @remarks
 * Keep labels, icons, route names, and permissions aligned with
 * `features/products/routes.ts`.
 */
export const productsNavigation: SidebarNavItem[] = [
  {
    label: "Products",
    icon: "i-lucide-package",
    to: { name: ProductsPageName.PRODUCTS_LIST },
    permissions: [Permission.PRODUCTS_READ],
  },
]
