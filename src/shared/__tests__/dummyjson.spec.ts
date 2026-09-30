import { beforeEach, describe, expect, it, vi } from "vitest"

import axiosInstance from "@/plugins/axios"

import { DUMMYJSON_BASE_URL, pageToSkip, requestDummyJson } from "../services/dummyjson"

vi.mock("@/plugins/axios", () => ({
  default: { request: vi.fn<(config: unknown) => Promise<unknown>>() },
}))

const request = vi.mocked(axiosInstance.request)

describe("requestDummyJson", () => {
  beforeEach(() => {
    request.mockReset()
  })

  it("targets DummyJSON and never attaches the auth token", async () => {
    request.mockResolvedValue({ data: { ok: true } })

    await requestDummyJson({ url: "/products", method: "GET", meta: { requiresAuth: true } })

    expect(request).toHaveBeenCalledWith({
      url: "/products",
      method: "GET",
      baseURL: DUMMYJSON_BASE_URL,
      meta: { requiresAuth: false },
    })
  })

  it("returns the response body", async () => {
    request.mockResolvedValue({ data: { id: 1 } })

    await expect(requestDummyJson<{ id: number }>({ url: "/products/1" })).resolves.toEqual({ id: 1 })
  })

  it("propagates rejections from the interceptor", async () => {
    request.mockRejectedValue({ message: "Network Error" })

    await expect(requestDummyJson({ url: "/products" })).rejects.toEqual({ message: "Network Error" })
  })
})

describe("pageToSkip", () => {
  it.each([
    [1, 10, 0],
    [2, 10, 10],
    [5, 20, 80],
    [0, 10, 0],
    [3, 0, 0],
  ])("page %i with limit %i skips %i", (page, limit, expected) => {
    expect(pageToSkip(page, limit)).toBe(expected)
  })
})
