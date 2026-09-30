import type { Customer, CustomerRole } from "@/features/customers/models"
import type { SortOrder } from "@/shared/models/dummyjson"

export enum UsersPageName {
  USERS_LIST = "UsersList",
}

/**
 * DummyJSON user account.
 *
 * @remarks
 * Same `/users` resource the customers feature reads; this feature manages the
 * account side (identity, role) rather than purchase history.
 */
export type User = Customer

export type UserRole = CustomerRole

export const USER_GENDERS = ["female", "male"] as const

export type UserGender = (typeof USER_GENDERS)[number]

/** Subset of user fields rendered by the management table. */
export type UserListItem = Pick<
  User,
  "id" | "firstName" | "lastName" | "username" | "email" | "phone" | "age" | "gender" | "image" | "role"
>

export type UserSortField = "firstName" | "username" | "age"

export type UserListParams = {
  page: number
  limit: number
  search: string
  sortBy: UserSortField
  order: SortOrder
}

/** Todo record returned by `GET /todos/user/:id`. */
export type UserTodo = {
  id: number
  todo: string
  completed: boolean
  userId: number
}
