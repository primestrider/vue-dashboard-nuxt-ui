/**
 * Component test harness that installs the same plugins as `main.ts`.
 *
 * @remarks
 * Components are rendered inside `UApp` so tooltips, toasts, and `useOverlay`
 * work as in the app. Modals and slideovers teleport to `document.body`, so
 * query them through the returned `screen` rather than the wrapper.
 *
 * @example
 * ```ts
 * const { wrapper } = await renderWithPlugins(ProductsListView, {
 *   permissions: [Permission.PRODUCTS_READ],
 * })
 * expect(wrapper.text()).toContain("Products")
 * ```
 */

import UApp from "@nuxt/ui/components/App.vue"
import ui from "@nuxt/ui/vue-plugin"
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query"
import { DOMWrapper, flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { type Component, defineComponent, h, nextTick } from "vue"

import { i18n } from "@/plugins/language"
import router from "@/router"
import type { PermissionKey } from "@/shared/models/access"
import { Permission } from "@/shared/models/access"
import { useAccessStore } from "@/shared/stores/useAccessStore"

type RenderOptions = {
  props?: Record<string, unknown>
  /** Permissions granted to the signed-in user. Defaults to every permission. */
  permissions?: PermissionKey[]
  /** Components replaced with stubs, e.g. charts that need a real layout engine. */
  stubs?: Record<string, Component | boolean>
  /**
   * URL the router is on when the component mounts, e.g. `"/products/list?page=2"`.
   * Defaults to a blank path so query state never leaks between tests.
   */
  route?: string
}

/** Waits for pending promises (queries, mutations) and the resulting re-render. */
export const settle = async () => {
  await flushPromises()
  await nextTick()
  await flushPromises()
}

export const renderWithPlugins = async (component: Component, options: RenderOptions = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })

  const pinia = createPinia()
  setActivePinia(pinia)
  useAccessStore(pinia).setAccess({
    roles: [],
    permissions: options.permissions ?? Object.values(Permission),
  })

  i18n.global.locale.value = "en"
  await router.replace(options.route ?? "/__test__")

  const Host = defineComponent({
    setup() {
      return () => h(UApp, null, { default: () => h(component, options.props ?? {}) })
    },
  })

  const wrapper = mount(Host, {
    attachTo: document.body,
    global: {
      plugins: [ui, pinia, router, i18n, [VueQueryPlugin, { queryClient }]],
      stubs: options.stubs,
    },
  })

  await settle()

  return {
    wrapper,
    queryClient,
    component: wrapper.findComponent(component),
    router,
    /** The whole document, including teleported overlays. */
    screen: new DOMWrapper(document.body),
  }
}
