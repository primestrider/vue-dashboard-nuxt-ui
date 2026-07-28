<!-- src/components/form/BaseFormField.vue -->
<script setup lang="ts">
import { computed, useId } from "vue"

import type { BaseFormFieldProps } from "../models"

/**
 * BaseFormField
 *
 * Headless form field wrapper with:
 * - Reserved space for label & messages (prevents layout shift)
 * - Accessible error & hint handling
 * - Clean DOM (no fake placeholders like &nbsp;)
 *
 * Responsibilities:
 * - Layout & accessibility only
 * - Does NOT manage form state or validation logic
 *
 * Expected usage:
 * - Parent handles value & validation
 * - This component only renders structure
 */
const {
  label = "",
  fieldName = "",
  error = null,
  required = false,
  hint = "",
  disabled = false,
} = defineProps<BaseFormFieldProps>()

/**
 * Generate stable unique ID
 * Used when fieldName is not provided
 */
const uid = useId()

/**
 * Whether the field currently has an error
 * Disabled fields do not display errors
 */
const hasError = computed(() => Boolean(error) && !disabled)

/**
 * Error message ID (for aria-describedby)
 */
const errorId = computed(() => (hasError.value ? `${fieldName || uid}-error` : undefined))

/**
 * Hint message ID (for aria-describedby)
 */
const hintId = computed(() => (hint && !hasError.value ? `${fieldName || uid}-hint` : undefined))

/**
 * aria-describedby value
 * Points to either error or hint message
 */
const describedBy = computed(() => errorId.value || hintId.value)
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Label (reserved height to prevent layout shift) -->
    <label
      :for="fieldName || undefined"
      class="min-h-2 ml-2 text-sm font-medium flex items-end transition"
      :class="disabled ? 'text-slate-500' : 'text-slate-300'"
    >
      <slot name="label">
        <span :class="label ? '' : 'invisible'">
          {{ label || "placeholder" }}
        </span>
      </slot>

      <span v-if="required && !disabled && label" class="ml-0.5 text-red-400" aria-hidden="true">
        *
      </span>
    </label>

    <!-- Input -->
    <div
      class="flex items-center min-h-[3rem]"
      :aria-invalid="hasError"
      :aria-describedby="describedBy"
    >
      <slot />
    </div>

    <!-- Message row (reserved height, no fake content) -->
    <div class="min-h-2 text-sm ml-2" aria-live="polite">
      <p v-if="hasError" :id="errorId" class="text-red-400">
        {{ error }}
      </p>

      <p v-else-if="hint" :id="hintId" class="text-slate-400">
        {{ hint }}
      </p>
    </div>
  </div>
</template>
