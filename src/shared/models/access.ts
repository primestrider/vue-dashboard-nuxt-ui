/**
 * RBAC constants shared between frontend navigation, route guards, and backend ACL.
 *
 * @remarks
 * Keep every key in sync with backend permission definitions.
 * Use the `resource:action` naming convention for predictable mapping.
 *
 * @example
 * ```ts
 * if (accessStore.hasPermission(Permission.ORDERS_READ)) {
 *   // show orders UI
 * }
 * ```
 */
export const Permission = {
  DASHBOARD_VIEW: "dashboard:view",
  ORDERS_READ: "orders:read",
  CUSTOMERS_READ: "customers:read",
  TRANSACTIONS_READ: "transactions:read",
  PRODUCTS_READ: "products:read",
  PRODUCTS_WRITE: "products:write",
  RECIPES_READ: "recipes:read",
  POSTS_READ: "posts:read",
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
} as const

/**
 * Union of all supported permission keys.
 */
export type PermissionKey = (typeof Permission)[keyof typeof Permission]

/**
 * Coarse-grained role keys optionally returned by the backend.
 *
 * @remarks
 * Prefer permission checks for feature-level access.
 * Roles are useful for broad UI sections or fallback rules.
 */
export const Role = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
} as const

/**
 * Union of all supported role keys.
 */
export type RoleKey = (typeof Role)[keyof typeof Role]

/**
 * Access profile hydrated from auth endpoints such as `/me` or `/auth/session`.
 */
export type AccessProfile = {
  /** Roles assigned to the signed-in user. */
  roles: RoleKey[]
  /** Fine-grained permissions assigned to the signed-in user. */
  permissions: PermissionKey[]
}
