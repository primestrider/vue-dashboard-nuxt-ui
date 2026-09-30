import { describe, expect, it } from "vitest"

import App from "../App.vue"
import { renderWithPlugins, settle } from "./render"

describe("App", () => {
  it("renders the routed page inside the app shell", async () => {
    const { wrapper } = await renderWithPlugins(App, { route: "/this-page-does-not-exist" })
    await settle()

    expect(wrapper.text()).toContain("Page Not Found")
  })
})
