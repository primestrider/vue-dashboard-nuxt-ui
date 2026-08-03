import type { NavigationMenuItem } from "@nuxt/ui"
import { computed } from "vue"

import { filterNavigationItems } from "@/shared/navigation/filter-navigation"
import { sidebarNavigationGroups } from "@/shared/navigation/registry"
import { useAccessStore } from "@/shared/stores/useAccessStore"

/**
 * Builds the sidebar menu for `UNavigationMenu`.
 *
 * @returns Reactive sidebar items filtered by the current user's access.
 *
 * @remarks
 * Reads the central navigation registry and filters it through
 * {@link useAccessStore}. Recomputed automatically when permissions or roles change.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { items } = useSidebarNavigation()
 * </script>
 *
 * <template>
 *   <UNavigationMenu :items="items" orientation="vertical" />
 * </template>
 * ```
 */
export function useSidebarNavigation() {
  const accessStore = useAccessStore()

  /** Sidebar items safe to pass into `UNavigationMenu`. */
  const items = computed<NavigationMenuItem[]>(() => {
    const access = {
      permissions: accessStore.permissionSet,
      roles: accessStore.roleSet,
    }

    return sidebarNavigationGroups.flatMap((group) =>
      filterNavigationItems(group.items, access),
    )
  })

  return {
    items,
  }
}
