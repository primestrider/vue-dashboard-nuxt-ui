/**
 * Customers API client backed by DummyJSON users.
 */

import type { DummyJsonList } from "@/shared/models/dummyjson"
import { pageToSkip, requestDummyJson } from "@/shared/services/dummyjson"

import type { Customer, CustomerListItem, CustomerListParams, CustomerSummary } from "../models"

export type CustomerListResponse = DummyJsonList<"users", CustomerListItem>

/** Fields requested for list rows, keeping the payload small. */
const LIST_FIELDS = "firstName,lastName,email,phone,age,image,role,company,address"

/** TanStack Query keys for the customers feature. */
export const customerQueryKeys = {
  all: ["customers"] as const,
  list: (params: CustomerListParams) => [...customerQueryKeys.all, "list", params] as const,
  detail: (id: number) => [...customerQueryKeys.all, "detail", id] as const,
  directory: () => [...customerQueryKeys.all, "directory"] as const,
  count: () => [...customerQueryKeys.all, "count"] as const,
}

/**
 * Resolves which DummyJSON endpoint serves a list request.
 *
 * @remarks
 * DummyJSON cannot combine search with a field filter, so search wins.
 */
export const resolveCustomerListUrl = ({
  search,
  role,
}: Pick<CustomerListParams, "search" | "role">): {
  url: string
  params: { q?: string; key?: string; value?: string }
} => {
  const query = search.trim()

  if (query) {
    return { url: "/users/search", params: { q: query } }
  }

  if (role) {
    return { url: "/users/filter", params: { key: "role", value: role } }
  }

  return { url: "/users", params: {} }
}

/**
 * Fetches one page of customers.
 *
 * @param params - Pagination, filter, and sort state from the list view.
 */
export const getCustomers = (params: CustomerListParams): Promise<CustomerListResponse> => {
  const { url, params: filterParams } = resolveCustomerListUrl(params)

  return requestDummyJson<CustomerListResponse>({
    url,
    method: "GET",
    params: {
      ...filterParams,
      limit: params.limit,
      skip: pageToSkip(params.page, params.limit),
      select: LIST_FIELDS,
      sortBy: params.sortBy,
      order: params.order,
    },
  })
}

/** Fetches the total number of customers without downloading the records. */
export const getCustomerCount = async (): Promise<number> => {
  const { total } = await requestDummyJson<DummyJsonList<"users", Pick<Customer, "id">>>({
    url: "/users",
    method: "GET",
    params: { limit: 1, select: "id" },
  })

  return total
}

/** Fetches a single customer profile. */
export const getCustomer = (id: number): Promise<Customer> =>
  requestDummyJson<Customer>({ url: `/users/${id}`, method: "GET" })

/**
 * Fetches a lightweight identity for every customer.
 *
 * @remarks
 * Used to label orders with customer names without one request per row.
 */
export const getCustomerDirectory = async (): Promise<CustomerSummary[]> => {
  const { users } = await requestDummyJson<DummyJsonList<"users", CustomerSummary>>({
    url: "/users",
    method: "GET",
    params: { limit: 0, select: "firstName,lastName,email,image" },
  })

  return users
}
