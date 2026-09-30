import { Permission } from "@/shared/models/access"
import type { SidebarNavItem } from "@/shared/navigation/types"

import { UsersPageName } from "./models"

/**
 * Sidebar entries owned by the users feature.
 *
 * @remarks
 * Keep labels, icons, route names, and permissions aligned with
 * `features/users/routes.ts`.
 */
export const usersNavigation: SidebarNavItem[] = [
  {
    label: "Users",
    icon: "i-lucide-user-cog",
    to: { name: UsersPageName.USERS_LIST },
    permissions: [Permission.USERS_READ],
  },
]
