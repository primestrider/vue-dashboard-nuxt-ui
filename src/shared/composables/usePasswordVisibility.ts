import { computed, reactive, ref } from "vue";

export function usePasswordVisibility() {
  const visible = ref(false);

  return reactive({
    visible,
    type: computed(() => (visible.value ? "text" : "password")),
    icon: computed(() => (visible.value ? "i-lucide-eye-off" : "i-lucide-eye")),
    ariaLabel: computed(() => (visible.value ? "Hide password" : "Show password")),
    toggle() {
      visible.value = !visible.value;
    },
  });
}
