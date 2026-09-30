import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"

import * as orderApi from "@/features/orders/services/api"

import CustomerDetailSlideover from "../components/CustomerDetailSlideover.vue"
import type { Customer, CustomerListItem } from "../models"
import * as api from "../services/api"
import CustomersListView from "../views/CustomersListView.vue"

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getCustomers: vi.fn<(...args: unknown[]) => unknown>(),
  getCustomer: vi.fn<(...args: unknown[]) => unknown>(),
}))

vi.mock("@/features/orders/services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/orders/services/api")>()),
  getOrdersByCustomer: vi.fn<(...args: unknown[]) => unknown>(),
}))

const customer: CustomerListItem = {
  id: 1,
  firstName: "Emily",
  lastName: "Johnson",
  email: "emily.johnson@x.dummyjson.com",
  phone: "+81 965-431-3024",
  age: 29,
  image: "",
  role: "admin",
  company: { name: "Dooley, Kozey and Cronin", title: "Sales Manager", department: "Engineering" },
  address: { address: "626 Main Street", city: "Phoenix", state: "Mississippi", postalCode: "29112", country: "United States" },
}

afterEach(() => {
  vi.clearAllMocks()
})

describe("CustomersListView", () => {
  beforeEach(() => {
    vi.mocked(api.getCustomers).mockResolvedValue({ users: [customer], total: 208, skip: 0, limit: 10 })
  })

  it("renders customers with company, location, and role", async () => {
    const { wrapper } = await renderWithPlugins(CustomersListView)

    const text = wrapper.text()
    expect(text).toContain("Emily Johnson")
    expect(text).toContain("Dooley, Kozey and Cronin")
    expect(text).toContain("Phoenix, Mississippi")
    expect(text).toContain("Admin")
    expect(text).toContain("1–10 of 208")
  })

  it("filters by role from the role tabs", async () => {
    const { wrapper } = await renderWithPlugins(CustomersListView)

    const moderatorTab = wrapper.findAll('[role="tab"]').find((tab) => tab.text() === "Moderator")
    await moderatorTab?.trigger("mousedown", { button: 0 })
    await moderatorTab?.trigger("click")
    await settle()

    expect(api.getCustomers).toHaveBeenLastCalledWith(expect.objectContaining({ role: "moderator", page: 1 }))
  })

  it("toggles server-side sorting from the column header", async () => {
    const { wrapper } = await renderWithPlugins(CustomersListView)

    await wrapper.get('button[aria-label="Sort by Age"]').trigger("click")
    await settle()
    expect(api.getCustomers).toHaveBeenLastCalledWith(expect.objectContaining({ sortBy: "age", order: "asc" }))

    await wrapper.get('button[aria-label="Sort by Age"]').trigger("click")
    await settle()
    expect(api.getCustomers).toHaveBeenLastCalledWith(expect.objectContaining({ sortBy: "age", order: "desc" }))
  })
})

describe("CustomerDetailSlideover", () => {
  it("shows the profile and lifetime spend across orders", async () => {
    vi.mocked(api.getCustomer).mockResolvedValue({
      ...customer,
      username: "emilys",
      gender: "female",
      birthDate: "1996-05-30",
    } as Customer)
    vi.mocked(orderApi.getOrdersByCustomer).mockResolvedValue({
      carts: [
        { id: 3, products: [], total: 120, discountedTotal: 100.5, userId: 1, totalProducts: 2, totalQuantity: 3 },
        { id: 9, products: [], total: 60, discountedTotal: 49.5, userId: 1, totalProducts: 1, totalQuantity: 1 },
      ],
      total: 2,
      skip: 0,
      limit: 0,
    })

    const { screen } = await renderWithPlugins(CustomerDetailSlideover, { props: { open: true, customerId: 1 } })

    expect(screen.text()).toContain("@emilys")
    expect(screen.text()).toContain("emily.johnson@x.dummyjson.com")

    const ordersTab = screen.findAll('[role="tab"]').find((tab) => tab.text().startsWith("Orders"))
    await ordersTab?.trigger("mousedown", { button: 0 })
    await settle()

    expect(screen.text()).toContain("$150.00")
    expect(screen.text()).toContain("Order #3")
  })
})
