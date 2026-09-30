import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"

import ImageGeneratorView from "../views/ImageGeneratorView.vue"

const urlField = (root: { get: (selector: string) => { element: Element } }) =>
  (root.get("input[readonly]").element as HTMLInputElement).value

const clickButton = async (
  root: { findAll: (selector: string) => { text: () => string; trigger: (event: string) => Promise<void> }[] },
  label: string,
) => {
  await root.findAll("button").find((button) => button.text().startsWith(label))?.trigger("click")
  await settle()
}

describe("ImageGeneratorView", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("starts from the social card preset", async () => {
    const { wrapper } = await renderWithPlugins(ImageGeneratorView)

    expect(urlField(wrapper)).toBe(
      "https://dummyjson.com/image/1200x630/1e293b/f1f5f9?fontSize=64&fontFamily=poppins&type=png",
    )
    expect(wrapper.get('button[aria-pressed="true"]').text()).toContain("Social card")
  })

  it("applies a preset and swaps dimensions", async () => {
    const { wrapper } = await renderWithPlugins(ImageGeneratorView)

    await clickButton(wrapper, "Banner")
    expect(urlField(wrapper)).toContain("/image/1500x500/")

    await wrapper.get('button[aria-label="Swap width and height"]').trigger("click")
    await settle()
    expect(urlField(wrapper)).toContain("/image/500x1500/")
  })

  it("adds typed text to the URL and debounces the preview", async () => {
    const { wrapper } = await renderWithPlugins(ImageGeneratorView)
    const preview = () => wrapper.get("img").attributes("src")

    await wrapper.get('input[maxlength="60"]').setValue("Hello Peter")
    expect(urlField(wrapper)).toContain("text=Hello+Peter")
    expect(preview()).not.toContain("text=")

    await vi.advanceTimersByTimeAsync(450)
    expect(preview()).toContain("text=Hello+Peter")
  })

  it("copies the URL to the clipboard", async () => {
    const write = vi.fn<(...args: unknown[]) => unknown>().mockResolvedValue(undefined)
    const writeText = vi.fn<(...args: unknown[]) => unknown>().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { write, writeText }, configurable: true })
    vi.stubGlobal(
      "ClipboardItem",
      class {
        constructor(readonly items: Record<string, Blob>) {}
      },
    )
    // jsdom has no Permissions API, so VueUse may fall back to the legacy copy command.
    const execCommand = vi.fn<(...args: unknown[]) => unknown>().mockReturnValue(true)
    Object.defineProperty(document, "execCommand", { value: execCommand, configurable: true })
    const { wrapper, screen } = await renderWithPlugins(ImageGeneratorView)

    await clickButton(wrapper, "Copy URL")

    const copies = write.mock.calls.length + writeText.mock.calls.length + execCommand.mock.calls.length
    expect(copies).toBe(1)
    expect(screen.text()).toContain("URL copied")
  })

  it("explains when DummyJSON can't render the image", async () => {
    const { wrapper } = await renderWithPlugins(ImageGeneratorView)

    await wrapper.get("img").trigger("error")

    expect(wrapper.text()).toContain("DummyJSON couldn't render this image")
  })

  it("resets every option", async () => {
    const { wrapper } = await renderWithPlugins(ImageGeneratorView)

    await clickButton(wrapper, "Avatar")
    await clickButton(wrapper, "Reset")

    expect(urlField(wrapper)).toContain("/image/1200x630/")
  })
})
