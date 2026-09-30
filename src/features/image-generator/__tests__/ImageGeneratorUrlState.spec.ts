import { mount } from "@vue/test-utils"
import ui from "@nuxt/ui/vue-plugin"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"
import { type QueryParam, resolveParam } from "@/shared/helpers/query-param"

import ColorField from "../components/ColorField.vue"
import { imageUrlParams } from "../helpers/url-state"
import ImageGeneratorView from "../views/ImageGeneratorView.vue"

const urlField = (wrapper: { get: (selector: string) => { element: Element } }) =>
  (wrapper.get("input[readonly]").element as HTMLInputElement).value

describe("image generator URL parameters", () => {
  it("stores colors without # and restores them with it", () => {
    expect(resolveParam(imageUrlParams.bg, "008080").value).toBe("#008080")
    expect(resolveParam(imageUrlParams.bg, "ABC").value).toBe("#abc")
    expect(imageUrlParams.bg.serialize?.("#008080")).toBe("008080")
  })

  it.each([
    ["bg", "red"],
    ["bg", "12345"],
    ["w", "0"],
    ["w", "4001"],
    ["size", "500"],
    ["font", "comic-sans"],
    ["format", "gif"],
    ["text", "x".repeat(61)],
  ] as const)("rejects %s=%s", (key, raw) => {
    expect(resolveParam(imageUrlParams[key] as QueryParam<unknown>, raw).valid).toBe(false)
  })
})

describe("ImageGeneratorView URL state", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("rebuilds the image from a shared link", async () => {
    const { wrapper } = await renderWithPlugins(ImageGeneratorView, {
      route: "/tools/image-generator?w=400&h=200&bg=008080&fg=ffffff&text=Hello&size=16&font=pacifico&format=webp",
    })

    expect(urlField(wrapper)).toBe(
      "https://dummyjson.com/image/400x200/008080/ffffff?text=Hello&fontSize=16&fontFamily=pacifico&type=webp",
    )
  })

  it("falls back to defaults for tampered values and cleans the URL", async () => {
    const { wrapper, router } = await renderWithPlugins(ImageGeneratorView, {
      route: "/tools/image-generator?w=99999&bg=javascript:alert(1)&font=../../etc&h=300",
    })
    await settle()

    expect(urlField(wrapper)).toBe(
      "https://dummyjson.com/image/1200x300/1e293b/f1f5f9?fontSize=64&fontFamily=poppins&type=png",
    )
    expect(router.currentRoute.value.query).toEqual({ h: "300" })
  })

  it("updates the URL shortly after a preset is chosen", async () => {
    const { wrapper, router } = await renderWithPlugins(ImageGeneratorView, { route: "/tools/image-generator" })

    await wrapper.findAll("button").find((button) => button.text().startsWith("Avatar"))?.trigger("click")
    expect(urlField(wrapper)).toContain("/image/256x256/")
    expect(router.currentRoute.value.query).toEqual({})

    await vi.advanceTimersByTimeAsync(350)
    await settle()
    expect(router.currentRoute.value.query).toEqual({ w: "256", h: "256" })
  })
})

describe("ColorField", () => {
  const mountField = (modelValue: string) =>
    mount(ColorField, {
      props: { modelValue, label: "Background" },
      global: { plugins: [ui] },
      attachTo: document.body,
    })

  it("only emits complete hex colors", async () => {
    const wrapper = mountField("#1e293b")
    const input = wrapper.get("input")

    await input.setValue("#12")
    await input.setValue("#12345")
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()

    await input.setValue("ff8800")
    expect(wrapper.emitted("update:modelValue")).toEqual([["#ff8800"]])
  })

  it("restores the last valid color on blur", async () => {
    const wrapper = mountField("#1e293b")
    const input = wrapper.get("input")

    await input.setValue("#12")
    await input.trigger("blur")

    expect((input.element as HTMLInputElement).value).toBe("#1e293b")
  })
})
