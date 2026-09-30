import { Permission } from "@/shared/models/access"
import type { SidebarNavItem } from "@/shared/navigation/types"

import { PostsPageName } from "./models"

/**
 * Sidebar entries owned by the posts feature.
 *
 * @remarks
 * Keep labels, icons, route names, and permissions aligned with
 * `features/posts/routes.ts`.
 */
export const postsNavigation: SidebarNavItem[] = [
  {
    label: "Posts",
    icon: "i-lucide-newspaper",
    to: { name: PostsPageName.POSTS_LIST },
    permissions: [Permission.POSTS_READ],
  },
]
