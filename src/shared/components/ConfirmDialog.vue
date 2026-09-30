<script setup lang="ts">
import { translate } from "@/plugins/language"

/**
 * Confirmation modal designed for `useOverlay`.
 *
 * @remarks
 * Emits `close(true)` when confirmed and `close(false)` when dismissed, so the
 * caller can `await overlay.open(...).result`.
 *
 * @example
 * ```ts
 * const confirm = useOverlay().create(ConfirmDialog)
 * const confirmed = await confirm.open({ title: "Delete item?", confirmLabel: "Delete" }).result
 * ```
 */
const { color = "error" } = defineProps<{
  title: string
  description?: string
  confirmLabel: string
  color?: "error" | "primary"
}>()

const emit = defineEmits<{
  close: [confirmed: boolean]
}>()
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :close="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        color="neutral"
        variant="ghost"
        size="lg"
        :label="translate('utils.common.cancel')"
        @click="emit('close', false)"
      />
      <UButton :color="color" size="lg" :label="confirmLabel" @click="emit('close', true)" />
    </template>
  </UModal>
</template>
