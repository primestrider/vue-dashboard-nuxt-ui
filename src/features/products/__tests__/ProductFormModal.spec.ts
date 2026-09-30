import { afterEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"

import ProductFormModal from "../components/ProductFormModal.vue"
import type { Product } from "../models"
import * as api from "../services/api"

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getProduct: vi.fn<(...args: unknown[]) => unknown>(),
  createProduct: vi.fn<(...args: unknown[]) => unknown>(),
  updateProduct: vi.fn<(...args: unknown[]) => unknown>(),
}))

const categories = [{ slug: "beauty", name: "Beauty", url: "" }]

const existingProduct = {
  id: 7,
  title: "Essence Mascara",
  description: "Volumizing mascara",
  category: "beauty",
  brand: "Essence",
  price: 9.99,
  discountPercentage: 7,
  stock: 5,
} as Product

describe("ProductFormModal", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("shows validation errors and sends nothing for an empty form", async () => {
    const { screen } = await renderWithPlugins(ProductFormModal, { props: { open: true, categories } })

    expect(screen.text()).toContain("Add product")

    await screen.get("form#product-form").trigger("submit")
    await settle()

    expect(screen.text()).toContain("Title is required")
    expect(screen.text()).toContain("Choose a category")
    expect(screen.text()).toContain("Price must be greater than 0")
    expect(api.createProduct).not.toHaveBeenCalled()
  })

  it("prefills the form from the full product when editing", async () => {
    vi.mocked(api.getProduct).mockResolvedValue(existingProduct)

    const { screen } = await renderWithPlugins(ProductFormModal, {
      props: { open: true, productId: 7, categories },
    })

    expect(api.getProduct).toHaveBeenCalledWith(7)
    expect(screen.text()).toContain("Edit product")
    expect((screen.get('input[name="title"]').element as HTMLInputElement).value).toBe("Essence Mascara")
    expect((screen.get('textarea[name="description"]').element as HTMLTextAreaElement).value).toBe(
      "Volumizing mascara",
    )
  })

  it("saves edits and closes with the updated product", async () => {
    vi.mocked(api.getProduct).mockResolvedValue(existingProduct)
    vi.mocked(api.updateProduct).mockImplementation(async ({ id, payload }) => ({ id, ...payload }))

    const { screen, component } = await renderWithPlugins(ProductFormModal, {
      props: { open: true, productId: 7, categories },
    })

    await screen.get('input[name="title"]').setValue("Essence Mascara Lash Princess")
    await screen.get("form#product-form").trigger("submit")
    await settle()

    expect(api.updateProduct).toHaveBeenCalledWith({
      id: 7,
      payload: expect.objectContaining({ title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99 }),
    })
    expect(component.emitted("close")?.[0]?.[0]).toMatchObject({ id: 7, title: "Essence Mascara Lash Princess" })
  })

  it("closes without a result when cancelled", async () => {
    const { screen, component } = await renderWithPlugins(ProductFormModal, { props: { open: true, categories } })

    await screen.findAll("button").find((button) => button.text() === "Cancel")?.trigger("click")

    expect(component.emitted("close")).toEqual([[undefined]])
  })
})
