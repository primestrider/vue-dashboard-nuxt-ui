import type { Order } from "../models"

/** Aggregate figures for a set of orders. */
export type OrderSummary = {
  count: number
  /** Amount charged after discounts. */
  revenue: number
  /** Amount before discounts. */
  gross: number
  discounts: number
  units: number
  /** Revenue per order, `0` when there are no orders. */
  averageOrderValue: number
}

/** Rounds to cents so summed floating-point totals stay presentable and comparable. */
const toCents = (value: number) => Math.round(value * 100) / 100

/**
 * Aggregates revenue, discounts, and units across orders.
 *
 * @param orders - Orders to summarize.
 */
export const summarizeOrders = (orders: readonly Order[]): OrderSummary => {
  const totals = orders.reduce(
    (acc, order) => ({
      revenue: acc.revenue + order.discountedTotal,
      gross: acc.gross + order.total,
      units: acc.units + order.totalQuantity,
    }),
    { revenue: 0, gross: 0, units: 0 },
  )

  return {
    count: orders.length,
    revenue: toCents(totals.revenue),
    gross: toCents(totals.gross),
    discounts: toCents(totals.gross - totals.revenue),
    units: totals.units,
    averageOrderValue: orders.length ? toCents(totals.revenue / orders.length) : 0,
  }
}

/**
 * Returns the highest-value orders, largest first.
 *
 * @param orders - Orders to rank.
 * @param count - Number of orders to return.
 */
export const topOrdersByRevenue = (orders: readonly Order[], count: number): Order[] =>
  [...orders].sort((a, b) => b.discountedTotal - a.discountedTotal).slice(0, count)
