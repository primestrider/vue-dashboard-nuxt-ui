import ui from "@nuxt/ui/vue-plugin"
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"

import SearchInput from "../components/SearchInput.vue"

const mountSearch = (modelValue: string) =>
  mount(SearchInput, {
    props: { modelValue, placeholder: "Search products" },
    global: { plugins: [ui] },
  })

describe("SearchInput", () => {
  it("labels the field with its placeholder", () => {
    expect(mountSearch("").get("input").attributes("aria-label")).toBe("Search products")
  })

  it("hides the clear button while empty", () => {
    expect(mountSearch("").find('button[aria-label="Clear search"]').exists()).toBe(false)
  })

  it("clears the value from the clear button", async () => {
    const wrapper = mountSearch("phone")

    await wrapper.get('button[aria-label="Clear search"]').trigger("click")

    expect(wrapper.emitted("update:modelValue")).toContainEqual([""])
  })
})
