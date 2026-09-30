import ui from "@nuxt/ui/vue-plugin"
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"

import DataTablePagination from "../components/DataTablePagination.vue"

const mountPagination = (props: { page: number; limit: number; total: number }) =>
  mount(DataTablePagination, {
    props,
    global: { plugins: [ui] },
  })

describe("DataTablePagination", () => {
  it("summarizes the visible range", () => {
    expect(mountPagination({ page: 2, limit: 10, total: 194 }).text()).toContain("11–20 of 194")
  })

  it("clamps the range on the last page", () => {
    expect(mountPagination({ page: 20, limit: 10, total: 194 }).text()).toContain("191–194 of 194")
  })

  it("shows an empty range when there are no rows", () => {
    expect(mountPagination({ page: 1, limit: 10, total: 0 }).text()).toContain("0–0 of 0")
  })

  it("emits the next page when a page link is clicked", async () => {
    const wrapper = mountPagination({ page: 1, limit: 10, total: 50 })

    await wrapper.get('button[aria-label="Page 2"]').trigger("click")

    expect(wrapper.emitted("update:page")).toContainEqual([2])
  })
})
