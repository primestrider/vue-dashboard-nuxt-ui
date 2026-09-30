import type { SortOrder } from "@/shared/models/dummyjson"

export enum CustomersPageName {
  CUSTOMERS_LIST = "CustomersList",
}

export const CUSTOMER_ROLES = ["admin", "moderator", "user"] as const

export type CustomerRole = (typeof CUSTOMER_ROLES)[number]

export type CustomerAddress = {
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

/**
 * Customer record.
 *
 * @remarks
 * DummyJSON exposes customers as users (`/users`). Only the fields used by
 * this feature are typed.
 */
export type Customer = {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  age: number
  gender: string
  birthDate: string
  image: string
  role: CustomerRole
  address: CustomerAddress
  company: {
    name: string
    title: string
    department: string
  }
}

/** Subset of customer fields rendered by the list table. */
export type CustomerListItem = Pick<
  Customer,
  "id" | "firstName" | "lastName" | "email" | "phone" | "age" | "image" | "role" | "company" | "address"
>

/** Minimal customer identity used to label records owned by a customer. */
export type CustomerSummary = Pick<Customer, "id" | "firstName" | "lastName" | "email" | "image">

export type CustomerSortField = "firstName" | "age"

export type CustomerListParams = {
  page: number
  limit: number
  /** Free-text search. Takes precedence over {@link CustomerListParams.role}. */
  search: string
  /** Role filter, or empty for every role. */
  role: CustomerRole | ""
  sortBy: CustomerSortField
  order: SortOrder
}
