<script setup lang="ts">
import { ref, watch } from "vue"

import { translate } from "@/plugins/language"

import { HEX_COLOR_PATTERN } from "../models"

/**
 * Hex color input with a swatch that opens a color picker.
 *
 * @remarks
 * The text box keeps its own draft; the model only receives complete, valid
 * colors, so half-typed values like `#1e2f` never reach the image URL.
 */
defineProps<{
  label: string
}>()

const model = defineModel<string>({ required: true })

const draft = ref(model.value)

watch(model, (value) => {
  if (value.toLowerCase() !== draft.value.toLowerCase()) draft.value = value
})

function onDraftInput(value: string) {
  draft.value = value
  const trimmed = value.trim()
  if (HEX_COLOR_PATTERN.test(trimmed)) model.value = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
}

/** Restores the last valid color when the user leaves a half-typed value. */
const onBlur = () => {
  draft.value = model.value
}
</script>

<template>
  <UInput
    :model-value="draft"
    variant="outline"
    size="md"
    maxlength="7"
    spellcheck="false"
    :ui="{ base: 'font-mono uppercase ps-11' }"
    @update:model-value="(value) => onDraftInput(String(value))"
    @blur="onBlur"
  >
    <template #leading>
      <UPopover :content="{ align: 'start' }">
        <button
          type="button"
          class="size-6 rounded ring ring-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :style="{ backgroundColor: model }"
          :aria-label="translate('features.imageGenerator.form.pick_color', { name: label })"
        />

        <template #content>
          <UColorPicker v-model="model" class="p-3" />
        </template>
      </UPopover>
    </template>
  </UInput>
</template>
