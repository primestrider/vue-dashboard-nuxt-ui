import { beforeEach, describe, expect, it, vi } from "vitest"

import { requestDummyJson } from "@/shared/services/dummyjson"

import { getCustomerCount, getCustomerDirectory, getCustomers, resolveCustomerListUrl } from "../services/api"

vi.mock("@/shared/services/dummyjson", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/services/dummyjson")>()),
  requestDummyJson: vi.fn<typeof requestDummyJson>(),
}))

const request = vi.mocked(requestDummyJson)

describe("resolveCustomerListUrl", () => {
  it("lists every customer when no filter is set", () => {
    expect(resolveCustomerListUrl({ search: "", role: "" })).toEqual({ url: "/users", params: {} })
  })

  it("filters by role through the generic filter endpoint", () => {
    expect(resolveCustomerListUrl({ search: "", role: "admin" })).toEqual({
      url: "/users/filter",
      params: { key: "role", value: "admin" },
    })
  })

  it("lets search win over the role filter", () => {
    expect(resolveCustomerListUrl({ search: " emily ", role: "admin" })).toEqual({
      url: "/users/search",
      params: { q: "emily" },
    })
  })
})

describe("customers service", () => {
  beforeEach(() => {
    request.mockReset()
  })

  it("requests the selected page with sorting", async () => {
    request.mockResolvedValue({ users: [], total: 0, skip: 0, limit: 10 })

    await getCustomers({ page: 2, limit: 10, search: "", role: "moderator", sortBy: "age", order: "desc" })

    expect(request).toHaveBeenCalledWith({
      url: "/users/filter",
      method: "GET",
      params: expect.objectContaining({ key: "role", value: "moderator", skip: 10, sortBy: "age", order: "desc" }),
    })
  })

  it("reads the customer count from the list total", async () => {
    request.mockResolvedValue({ users: [{ id: 1 }], total: 208, skip: 0, limit: 1 })

    await expect(getCustomerCount()).resolves.toBe(208)
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ params: { limit: 1, select: "id" } }))
  })

  it("unwraps the directory into a plain array", async () => {
    const users = [{ id: 1, firstName: "Emily", lastName: "Johnson", email: "e@x.dev", image: "" }]
    request.mockResolvedValue({ users, total: 1, skip: 0, limit: 0 })

    await expect(getCustomerDirectory()).resolves.toEqual(users)
  })
})
