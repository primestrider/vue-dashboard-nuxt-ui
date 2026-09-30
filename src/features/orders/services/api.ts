/**
 * Orders API client backed by DummyJSON carts.
 */

import type { DummyJsonList } from "@/shared/models/dummyjson"
import { pageToSkip, requestDummyJson } from "@/shared/services/dummyjson"

import type { Order, OrderListParams } from "../models"

export type OrderListResponse = DummyJsonList<"carts", Order>

/** TanStack Query keys for the orders feature. */
export const orderQueryKeys = {
  all: ["orders"] as const,
  list: (params: OrderListParams) => [...orderQueryKeys.all, "list", params] as const,
  byCustomer: (customerId: number) => [...orderQueryKeys.all, "customer", customerId] as const,
  everything: () => [...orderQueryKeys.all, "everything"] as const,
}

/**
 * Fetches one page of orders.
 *
 * @param params - Pagination state. `limit: 0` returns every order.
 */
export const getOrders = (params: OrderListParams): Promise<OrderListResponse> =>
  requestDummyJson<OrderListResponse>({
    url: "/carts",
    method: "GET",
    params: {
      limit: params.limit,
      skip: pageToSkip(params.page, params.limit),
    },
  })

/** Fetches every order, for store-wide aggregates. */
export const getAllOrders = (): Promise<OrderListResponse> => getOrders({ page: 1, limit: 0 })

/** Fetches every order placed by one customer. */
export const getOrdersByCustomer = (customerId: number): Promise<OrderListResponse> =>
  requestDummyJson<OrderListResponse>({ url: `/carts/user/${customerId}`, method: "GET" })
