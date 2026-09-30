import { describe, expect, it } from "vitest"

import { summarizeOrders, topOrdersByRevenue } from "../helpers/order-summary"
import type { Order } from "../models"

const order = (overrides: Partial<Order>): Order => ({
  id: 1,
  products: [],
  total: 100,
  discountedTotal: 90,
  userId: 1,
  totalProducts: 1,
  totalQuantity: 1,
  ...overrides,
})

describe("summarizeOrders", () => {
  it("aggregates revenue, discounts, units, and average order value", () => {
    const summary = summarizeOrders([
      order({ id: 1, total: 100.1, discountedTotal: 90.05, totalQuantity: 2 }),
      order({ id: 2, total: 50.2, discountedTotal: 50.2, totalQuantity: 5 }),
    ])

    expect(summary).toEqual({
      count: 2,
      revenue: 140.25,
      gross: 150.3,
      discounts: 10.05,
      units: 7,
      averageOrderValue: 70.13,
    })
  })

  it("returns zeros for no orders instead of dividing by zero", () => {
    expect(summarizeOrders([])).toEqual({
      count: 0,
      revenue: 0,
      gross: 0,
      discounts: 0,
      units: 0,
      averageOrderValue: 0,
    })
  })
})

describe("topOrdersByRevenue", () => {
  it("ranks by discounted total without reordering the input", () => {
    const orders = [
      order({ id: 1, discountedTotal: 10 }),
      order({ id: 2, discountedTotal: 300 }),
      order({ id: 3, discountedTotal: 50 }),
    ]

    expect(topOrdersByRevenue(orders, 2).map((item) => item.id)).toEqual([2, 3])
    expect(orders.map((item) => item.id)).toEqual([1, 2, 3])
  })
})
