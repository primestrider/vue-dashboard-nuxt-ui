/**
 * Global Vitest setup: browser APIs that jsdom lacks but Nuxt UI (Reka UI) relies on.
 */

import { enableAutoUnmount } from "@vue/test-utils"
import { afterEach, vi } from "vitest"

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ""
  readonly thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

globalThis.ResizeObserver ??= ResizeObserverStub
globalThis.IntersectionObserver ??= IntersectionObserverStub as unknown as typeof IntersectionObserver

window.matchMedia ??= vi.fn<(query: string) => MediaQueryList>((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn<(...args: unknown[]) => unknown>(),
  removeListener: vi.fn<(...args: unknown[]) => unknown>(),
  addEventListener: vi.fn<(...args: unknown[]) => unknown>(),
  removeEventListener: vi.fn<(...args: unknown[]) => unknown>(),
  dispatchEvent: vi.fn<(event: Event) => boolean>(() => true),
}) as MediaQueryList)

Element.prototype.scrollIntoView ??= vi.fn<(...args: unknown[]) => unknown>()
Element.prototype.hasPointerCapture ??= vi.fn<(pointerId: number) => boolean>(() => false)
Element.prototype.releasePointerCapture ??= vi.fn<(...args: unknown[]) => unknown>()
window.scrollTo = vi.fn<(...args: unknown[]) => unknown>() as unknown as typeof window.scrollTo

// Unmount components after each test; their teleported overlays go with them.
enableAutoUnmount(afterEach)
