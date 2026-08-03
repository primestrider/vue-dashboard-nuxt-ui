import "vue-router"

import type { PermissionKey, RoleKey } from "@/shared/models/access"

declare module "vue-router" {
  interface RouteMeta {
    /**
     * Required permissions for route access.
     * The user must have **all** listed permissions.
     */
    permissions?: PermissionKey[]

    /**
     * Alternative permission rule for route access.
     * The user must have **at least one** listed permission.
     */
    permissionsAny?: PermissionKey[]

    /**
     * Required roles for route access.
     * The user must have **at least one** listed role.
     */
    roles?: RoleKey[]
  }
}
