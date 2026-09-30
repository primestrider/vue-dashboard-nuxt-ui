import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defineComponent, h } from "vue"

import { renderWithPlugins } from "@/__tests__/render"

import * as customerApi from "@/features/customers/services/api"
import * as orderApi from "@/features/orders/services/api"
import * as productApi from "@/features/products/services/api"

import DashboardView from "../views/DashboardView.vue"

vi.mock("@/features/orders/services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/orders/services/api")>()),
  getAllOrders: vi.fn<(...args: unknown[]) => unknown>(),
}))
vi.mock("@/features/products/services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/products/services/api")>()),
  getAllProducts: vi.fn<(...args: unknown[]) => unknown>(),
  getProductCategories: vi.fn<(...args: unknown[]) => unknown>(),
}))
vi.mock("@/features/customers/services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/customers/services/api")>()),
  getCustomerCount: vi.fn<(...args: unknown[]) => unknown>(),
}))

/** Unovis needs a real layout engine; the chart has its own coverage through its data helper. */
const ChartStub = defineComponent({
  name: "InventoryByCategoryChart",
  props: { data: { type: Array, required: true } },
  setup: (props) => () => h("div", { "data-test": "chart" }, `${props.data.length} categories`),
})

const line = (id: number, title: string) => ({
  id,
  title,
  price: 10,
  quantity: 1,
  total: 10,
  discountPercentage: 0,
  discountedTotal: 10,
  thumbnail: "",
})

describe("DashboardView", () => {
  beforeEach(() => {
    vi.mocked(orderApi.getAllOrders).mockResolvedValue({
      carts: [
        { id: 1, products: [line(1, "Blue Frock")], total: 120, discountedTotal: 100, userId: 1, totalProducts: 1, totalQuantity: 4 },
        { id: 2, products: [line(2, "Gaming Laptop")], total: 1000, discountedTotal: 900, userId: 2, totalProducts: 1, totalQuantity: 1 },
      ],
      total: 2,
      skip: 0,
      limit: 0,
    })
    vi.mocked(productApi.getAllProducts).mockResolvedValue({
      products: [
        { id: 1, title: "Nearly gone", category: "beauty", price: 5, discountPercentage: 0, rating: 4, stock: 2, thumbnail: "" },
        { id: 2, title: "Plenty", category: "laptops", price: 900, discountPercentage: 0, rating: 5, stock: 40, thumbnail: "" },
      ],
      total: 2,
      skip: 0,
      limit: 0,
    })
    vi.mocked(productApi.getProductCategories).mockResolvedValue([])
    vi.mocked(customerApi.getCustomerCount).mockResolvedValue(208)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("summarizes revenue, orders, average order, and customers", async () => {
    const { wrapper } = await renderWithPlugins(DashboardView, { stubs: { InventoryByCategoryChart: ChartStub } })

    const text = wrapper.text()
    expect(text).toContain("$1,000.00")
    expect(text).toContain("after $120.00 in discounts")
    expect(text).toContain("5 units sold")
    expect(text).toContain("$500.00")
    expect(text).toContain("208")
  })

  it("feeds the chart, lists low stock, and ranks the largest orders", async () => {
    const { wrapper } = await renderWithPlugins(DashboardView, { stubs: { InventoryByCategoryChart: ChartStub } })

    expect(wrapper.get("[data-test='chart']").text()).toBe("2 categories")
    expect(wrapper.text()).toContain("Nearly gone")
    expect(wrapper.text()).toContain("2 left")
    expect(wrapper.text()).not.toContain("Plenty")

    const orderRows = wrapper.findAll("ol > li").map((row) => row.text())
    expect(orderRows[0]).toContain("Gaming Laptop")
    expect(orderRows[1]).toContain("Blue Frock")
  })

  it("keeps the rest of the page when one source fails", async () => {
    vi.mocked(customerApi.getCustomerCount).mockRejectedValue({ message: "Network Error" })

    const { wrapper } = await renderWithPlugins(DashboardView, { stubs: { InventoryByCategoryChart: ChartStub } })

    expect(wrapper.text()).toContain("Some store figures didn't load")
    expect(wrapper.text()).toContain("$1,000.00")
  })
})
