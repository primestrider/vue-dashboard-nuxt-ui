export enum OrdersPageName {
  ORDERS_LIST = "OrdersList",
}

/** Line item inside a DummyJSON cart. */
export type OrderLine = {
  id: number
  title: string
  price: number
  quantity: number
  total: number
  discountPercentage: number
  discountedTotal: number
  thumbnail: string
}

/**
 * Order record.
 *
 * @remarks
 * DummyJSON exposes orders as carts (`/carts`).
 */
export type Order = {
  id: number
  products: OrderLine[]
  /** Sum of line totals before discounts. */
  total: number
  /** Amount charged after discounts. */
  discountedTotal: number
  userId: number
  totalProducts: number
  totalQuantity: number
}

export type OrderListParams = {
  page: number
  limit: number
}
