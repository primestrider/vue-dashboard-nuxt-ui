import { describe, expect, it } from "vitest"

import { renderWithPlugins } from "@/__tests__/render"

import ConfirmDialog from "../components/ConfirmDialog.vue"
import QueryErrorAlert from "../components/QueryErrorAlert.vue"

const buttonByText = (root: { findAll: (selector: string) => { text: () => string }[] }, label: string) =>
  root.findAll("button").find((button) => button.text() === label) as
    | { trigger: (event: string) => Promise<void> }
    | undefined

describe("ConfirmDialog", () => {
  const props = { open: true, title: "Delete Essence Mascara?", description: "It will be removed.", confirmLabel: "Delete product" }

  it("shows the question and both choices", async () => {
    const { screen } = await renderWithPlugins(ConfirmDialog, { props })

    const dialog = screen.get('[role="dialog"]')
    expect(dialog.text()).toContain("Delete Essence Mascara?")
    expect(dialog.text()).toContain("It will be removed.")
    expect(dialog.text()).toContain("Cancel")
    expect(dialog.text()).toContain("Delete product")
  })

  it("resolves true when confirmed", async () => {
    const { screen, component } = await renderWithPlugins(ConfirmDialog, { props })

    await buttonByText(screen, "Delete product")?.trigger("click")

    expect(component.emitted("close")).toEqual([[true]])
  })

  it("resolves false when cancelled", async () => {
    const { screen, component } = await renderWithPlugins(ConfirmDialog, { props })

    await buttonByText(screen, "Cancel")?.trigger("click")

    expect(component.emitted("close")).toEqual([[false]])
  })
})

describe("QueryErrorAlert", () => {
  it("prefers the server message and falls back to a generic one", async () => {
    const { wrapper } = await renderWithPlugins(QueryErrorAlert, {
      props: { title: "Products didn't load", error: { message: "x", data: { message: "Service unavailable" } } },
    })
    expect(wrapper.text()).toContain("Products didn't load")
    expect(wrapper.text()).toContain("Service unavailable")

    const fallback = await renderWithPlugins(QueryErrorAlert, { props: { title: "Oops", error: null } })
    expect(fallback.wrapper.text()).toContain("The request to DummyJSON failed")
  })

  it("emits retry from its action", async () => {
    const { wrapper, component } = await renderWithPlugins(QueryErrorAlert, {
      props: { title: "Products didn't load", error: { message: "Network Error" } },
    })

    await buttonByText(wrapper, "Try again")?.trigger("click")

    expect(component.emitted("retry")).toHaveLength(1)
  })
})
