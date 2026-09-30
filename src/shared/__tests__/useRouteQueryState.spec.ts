import { flushPromises, mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defineComponent, h, nextTick, ref } from "vue"
import { createMemoryHistory, createRouter, type Router } from "vue-router"

import { useDebouncedQueryModel, useRouteQueryState } from "../composables/useRouteQueryState"
import { literalParam, paginationParams, slugParam, stringParam, withAllowList } from "../helpers/query-param"

const categories = ref<string[] | undefined>(undefined)

const definitions = {
  ...paginationParams(),
  q: stringParam({ maxLength: 20 }),
  category: withAllowList(slugParam(), () => categories.value),
  sort: literalParam(["name_asc", "price_desc"], "name_asc"),
}

type State = ReturnType<typeof useRouteQueryState<typeof definitions>>

let router: Router

/** Waits for the batched write timer and the resulting navigation. */
const settle = async () => {
  await vi.runAllTimersAsync()
  await flushPromises()
  await nextTick()
}

const mountAt = async (url: string, options: Parameters<typeof useRouteQueryState>[1] = { resetKey: "page" }) => {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/list", component: { render: () => null } },
      { path: "/elsewhere", component: { render: () => null } },
    ],
  })
  await router.push(url)

  let state!: State
  const wrapper = mount(
    defineComponent({
      setup() {
        state = useRouteQueryState(definitions, options)
        return () => h("div")
      },
    }),
    { global: { plugins: [router] } },
  )
  await settle()

  return { state, wrapper }
}

const currentQuery = () => router.currentRoute.value.query

describe("useRouteQueryState", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    categories.value = undefined
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("reads validated values from the URL", async () => {
    const { state } = await mountAt("/list?page=3&limit=20&q=phone&category=laptops&sort=price_desc")

    expect(state.page.value).toBe(3)
    expect(state.limit.value).toBe(20)
    expect(state.q.value).toBe("phone")
    expect(state.category.value).toBe("laptops")
    expect(state.sort.value).toBe("price_desc")
  })

  it("falls back to defaults and removes invalid values from the URL", async () => {
    const { state } = await mountAt("/list?page=-4&limit=999&sort=evil&q=ok&utm_source=mail")

    expect(state.page.value).toBe(1)
    expect(state.limit.value).toBe(10)
    expect(state.sort.value).toBe("name_asc")
    // Valid and unrelated parameters are kept.
    expect(currentQuery()).toEqual({ q: "ok", utm_source: "mail" })
  })

  it("uses the first value of a repeated parameter", async () => {
    const { state } = await mountAt("/list?page=2&page=9")

    expect(state.page.value).toBe(2)
  })

  it("re-validates once the allow-list loads", async () => {
    const { state } = await mountAt("/list?category=made-up&page=2")
    expect(state.category.value).toBe("made-up")

    categories.value = ["beauty", "laptops"]
    await settle()

    expect(state.category.value).toBe("")
    expect(currentQuery()).toEqual({ page: "2" })
  })

  it("writes changes to the URL and omits defaults", async () => {
    const { state } = await mountAt("/list")

    state.sort.value = "price_desc"
    state.q.value = "phone"
    await settle()
    expect(currentQuery()).toEqual({ sort: "price_desc", q: "phone" })

    state.sort.value = "name_asc"
    await settle()
    expect(currentQuery()).toEqual({ q: "phone" })
  })

  it("shows written values immediately, before the navigation finishes", async () => {
    const { state } = await mountAt("/list")

    state.page.value = 4

    expect(state.page.value).toBe(4)
    expect(currentQuery()).toEqual({})
  })

  it("merges writes from the same tick into one navigation", async () => {
    const { state } = await mountAt("/list")
    const replace = vi.spyOn(router, "replace")

    state.q.value = "phone"
    state.sort.value = "price_desc"
    await settle()

    expect(replace).toHaveBeenCalledTimes(1)
  })

  it("resets the page when a filter changes", async () => {
    const { state } = await mountAt("/list?page=5&q=old")

    state.q.value = "new"
    await settle()

    expect(state.page.value).toBe(1)
    expect(currentQuery()).toEqual({ q: "new" })
  })

  it("keeps the page when only the page changes", async () => {
    const { state } = await mountAt("/list?q=phone")

    state.page.value = 3
    await settle()

    expect(currentQuery()).toEqual({ q: "phone", page: "3" })
  })

  it("restores state from history without resetting the page", async () => {
    const { state } = await mountAt("/list")
    await router.push("/list?q=phone&page=3")
    await settle()

    expect(state.q.value).toBe("phone")
    expect(state.page.value).toBe(3)
  })

  it("waits for the write delay before touching the URL", async () => {
    const { state } = await mountAt("/list", { writeDelay: 300 })

    state.q.value = "p"
    state.q.value = "ph"
    await vi.advanceTimersByTimeAsync(200)
    expect(currentQuery()).toEqual({})
    expect(state.q.value).toBe("ph")

    await settle()
    expect(currentQuery()).toEqual({ q: "ph" })
  })

  it("drops pending writes after navigating away", async () => {
    const { state } = await mountAt("/list", { writeDelay: 300 })

    state.q.value = "phone"
    await router.push("/elsewhere")
    await settle()

    expect(router.currentRoute.value.fullPath).toBe("/elsewhere")
  })
})

describe("useDebouncedQueryModel", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("commits the trimmed draft after typing pauses", async () => {
    const source = ref("")
    const draft = useDebouncedQueryModel(source, 300)

    draft.value = "pho"
    await vi.advanceTimersByTimeAsync(100)
    draft.value = "phone "
    await vi.advanceTimersByTimeAsync(299)
    expect(source.value).toBe("")

    await vi.advanceTimersByTimeAsync(1)
    expect(source.value).toBe("phone")
    // The trailing space the user is still typing is kept in the input.
    expect(draft.value).toBe("phone ")
  })

  it("follows the source when it changes elsewhere", async () => {
    const source = ref("phone")
    const draft = useDebouncedQueryModel(source, 300)

    source.value = ""
    await nextTick()

    expect(draft.value).toBe("")
  })
})
