import { Permission } from "@/shared/models/access"
import type { SidebarNavItem } from "@/shared/navigation/types"

import { RecipesPageName } from "./models"

/**
 * Sidebar entries owned by the recipes feature.
 *
 * @remarks
 * Keep labels, icons, route names, and permissions aligned with
 * `features/recipes/routes.ts`.
 */
export const recipesNavigation: SidebarNavItem[] = [
  {
    label: "Recipes",
    icon: "i-lucide-chef-hat",
    to: { name: RecipesPageName.RECIPES_LIST },
    permissions: [Permission.RECIPES_READ],
  },
]
