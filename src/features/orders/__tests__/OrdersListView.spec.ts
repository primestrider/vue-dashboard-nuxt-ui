import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"

import * as customerApi from "@/features/customers/services/api"

import type { Order } from "../models"
import * as api from "../services/api"
import OrdersListView from "../views/OrdersListView.vue"

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getOrders: vi.fn<(...args: unknown[]) => unknown>(),
}))

vi.mock("@/features/customers/services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/customers/services/api")>()),
  getCustomerDirectory: vi.fn<(...args: unknown[]) => unknown>(),
}))

const order: Order = {
  id: 12,
  userId: 1,
  total: 200,
  discountedTotal: 180,
  totalProducts: 2,
  totalQuantity: 3,
  products: [
    { id: 5, title: "Blue Frock", price: 50, quantity: 2, total: 100, discountPercentage: 10, discountedTotal: 90, thumbnail: "" },
    { id: 6, title: "Red Shoes", price: 100, quantity: 1, total: 100, discountPercentage: 10, discountedTotal: 90, thumbnail: "" },
  ],
}

describe("OrdersListView", () => {
  beforeEach(() => {
    vi.mocked(api.getOrders).mockResolvedValue({ carts: [order, { ...order, id: 13, userId: 999 }], total: 50, skip: 0, limit: 10 })
    vi.mocked(customerApi.getCustomerDirectory).mockResolvedValue([
      { id: 1, firstName: "Emily", lastName: "Johnson", email: "emily@x.dev", image: "" },
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("joins orders with their customers and shows totals", async () => {
    const { wrapper } = await renderWithPlugins(OrdersListView)

    const text = wrapper.text()
    expect(text).toContain("#12")
    expect(text).toContain("Emily Johnson")
    expect(text).toContain("Customer #999")
    expect(text).toContain("2 products, 3 units")
    expect(text).toContain("−$20.00")
    expect(text).toContain("$180.00")
  })

  it("expands an order to show its line items", async () => {
    const { wrapper } = await renderWithPlugins(OrdersListView)

    expect(wrapper.text()).not.toContain("Blue Frock")

    const toggle = wrapper.get('button[aria-label="Show items"]')
    await toggle.trigger("click")
    await settle()

    expect(wrapper.text()).toContain("Blue Frock")
    expect(wrapper.text()).toContain("Red Shoes")
    expect(wrapper.get('button[aria-label="Hide items"]').attributes("aria-expanded")).toBe("true")
  })

  it("requests the next page from the pagination", async () => {
    const { wrapper } = await renderWithPlugins(OrdersListView)

    await wrapper.get('button[aria-label="Page 2"]').trigger("click")
    await settle()

    expect(api.getOrders).toHaveBeenLastCalledWith({ page: 2, limit: 10 })
  })
})
