import { computed, reactive, ref } from "vue"

/**
 * Reactive helpers for toggling password field visibility.
 *
 * @returns An object with input type, icon, ARIA labels, and a toggle action.
 *
 * @remarks
 * Designed for use with `UInput` trailing buttons in authentication forms.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const passwordVisibility = usePasswordVisibility()
 * </script>
 *
 * <template>
 *   <UInput
 *     :type="passwordVisibility.type"
 *     :aria-pressed="passwordVisibility.visible"
 *   >
 *     <template #trailing>
 *       <UButton
 *         :icon="passwordVisibility.icon"
 *         :aria-label="passwordVisibility.ariaLabel"
 *         @click="passwordVisibility.toggle"
 *       />
 *     </template>
 *   </UInput>
 * </template>
 * ```
 */
export function usePasswordVisibility() {
  /** Whether the password value is currently visible. */
  const visible = ref(false)

  return reactive({
    visible,
    /** Input type to pass to `UInput`. */
    type: computed(() => (visible.value ? "text" : "password")),
    /** Icon name for the visibility toggle button. */
    icon: computed(() => (visible.value ? "i-lucide-eye-off" : "i-lucide-eye")),
    /** Accessible label for the visibility toggle button. */
    ariaLabel: computed(() => (visible.value ? "Hide password" : "Show password")),
    /** Flips the current visibility state. */
    toggle() {
      visible.value = !visible.value
    },
  })
}
