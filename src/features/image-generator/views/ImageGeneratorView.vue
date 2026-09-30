<script setup lang="ts">
import { refDebounced, useClipboard } from "@vueuse/core"
import { computed, reactive, ref, watch } from "vue"

import { translate } from "@/plugins/language"
import { useAppToast } from "@/plugins/nuxt-ui/toaster"

import { useRouteQueryState } from "@/shared/composables/useRouteQueryState"

import ColorField from "../components/ColorField.vue"
import { buildImageUrl, clampDimension, imageFileName } from "../helpers/image-url"
import { imageUrlParams } from "../helpers/url-state"
import {
  DEFAULT_IMAGE_OPTIONS,
  IMAGE_FONT_SIZE_RANGE,
  IMAGE_FONTS,
  IMAGE_FORMATS,
  IMAGE_MAX_SIZE,
  IMAGE_PRESETS,
  IMAGE_TEXT_MAX_LENGTH,
  type ImageOptions,
} from "../models"

const { showToast } = useAppToast()
const { copy, copied } = useClipboard({ copiedDuring: 2000 })

// Options live in the URL so a configured image survives a refresh and can be shared.
// Writes are delayed because sliders and typing change values continuously.
const { w, h, bg, fg, text, size, font, format } = useRouteQueryState(imageUrlParams, { writeDelay: 300 })

const options: ImageOptions = reactive({
  width: w,
  height: h,
  background: bg,
  foreground: fg,
  text,
  fontSize: size,
  fontFamily: font,
  format,
})

const imageUrl = computed(() => buildImageUrl(options))
/** Debounced so dragging a slider or typing doesn't request an image per keystroke. */
const previewUrl = refDebounced(imageUrl, 400)

const previewState = ref<"loading" | "ready" | "error">("loading")
watch(previewUrl, () => {
  previewState.value = "loading"
})

const fontItems = IMAGE_FONTS.map((font) => ({ label: font.charAt(0).toUpperCase() + font.slice(1), value: font }))
const formatItems = IMAGE_FORMATS.map((format) => ({ label: format.toUpperCase(), value: format }))

const activePreset = computed(
  () => IMAGE_PRESETS.find((preset) => preset.width === options.width && preset.height === options.height)?.key,
)

function applyPreset(preset: (typeof IMAGE_PRESETS)[number]) {
  options.width = preset.width
  options.height = preset.height
}

function swapDimensions() {
  ;[options.width, options.height] = [options.height, options.width]
}

const reset = () => Object.assign(options, DEFAULT_IMAGE_OPTIONS)

async function copyUrl() {
  await copy(imageUrl.value)
  showToast.success({ title: translate("features.imageGenerator.preview.copied"), description: imageUrl.value })
}

const isDownloading = ref(false)

/** Downloads through a blob so the file keeps a readable name across origins. */
async function download() {
  isDownloading.value = true

  try {
    const response = await fetch(imageUrl.value)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const objectUrl = URL.createObjectURL(await response.blob())
    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = imageFileName(options)
    anchor.click()
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    showToast.error({
      title: translate("features.imageGenerator.preview.download_failed"),
      description: error instanceof Error ? error.message : undefined,
    })
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="image-generator">
    <template #header>
      <UDashboardNavbar :title="translate('features.imageGenerator.page_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-rotate-ccw"
            color="neutral"
            variant="ghost"
            size="md"
            :label="translate('features.imageGenerator.form.reset')"
            @click="reset"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid shrink-0 gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        <!-- Controls -->
        <form class="space-y-5" @submit.prevent>
          <p class="text-sm text-muted">{{ translate("features.imageGenerator.description") }}</p>

          <fieldset>
            <legend class="mb-2 text-sm font-medium text-highlighted">
              {{ translate("features.imageGenerator.presets.label") }}
            </legend>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="preset in IMAGE_PRESETS"
                :key="preset.key"
                :color="activePreset === preset.key ? 'primary' : 'neutral'"
                :variant="activePreset === preset.key ? 'solid' : 'outline'"
                size="sm"
                :aria-pressed="activePreset === preset.key"
                @click="applyPreset(preset)"
              >
                {{ translate(`features.imageGenerator.presets.${preset.key}`) }}
                <span class="tabular-nums opacity-70">{{ preset.width }}×{{ preset.height }}</span>
              </UButton>
            </div>
          </fieldset>

          <div class="flex items-end gap-2">
            <UFormField :label="translate('features.imageGenerator.form.width')" class="flex-1">
              <UInputNumber v-model="options.width" :min="1" :max="IMAGE_MAX_SIZE" variant="outline" size="md" />
            </UFormField>
            <UButton
              icon="i-lucide-arrow-left-right"
              color="neutral"
              variant="ghost"
              size="md"
              class="mb-5"
              :aria-label="translate('features.imageGenerator.form.swap')"
              @click="swapDimensions"
            />
            <UFormField :label="translate('features.imageGenerator.form.height')" class="flex-1">
              <UInputNumber v-model="options.height" :min="1" :max="IMAGE_MAX_SIZE" variant="outline" size="md" />
            </UFormField>
          </div>

          <UFormField :label="translate('features.imageGenerator.form.text')" :help="translate('features.imageGenerator.form.text_hint')">
            <UInput
              v-model="options.text"
              variant="outline"
              size="md"
              :maxlength="IMAGE_TEXT_MAX_LENGTH"
              :placeholder="translate('features.imageGenerator.form.text_placeholder')"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField :label="translate('features.imageGenerator.form.font_family')">
              <USelectMenu v-model="options.fontFamily" :items="fontItems" value-key="value" variant="outline" size="md" />
            </UFormField>
            <UFormField :label="translate('features.imageGenerator.form.format')">
              <USelect v-model="options.format" :items="formatItems" variant="outline" size="md" />
            </UFormField>
          </div>

          <UFormField :label="translate('features.imageGenerator.form.font_size')">
            <div class="flex items-center gap-3 pt-1">
              <USlider v-model="options.fontSize" :min="IMAGE_FONT_SIZE_RANGE.min" :max="IMAGE_FONT_SIZE_RANGE.max" class="flex-1" />
              <span class="w-12 text-right text-sm text-toned tabular-nums">{{ options.fontSize }}px</span>
            </div>
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField :label="translate('features.imageGenerator.form.background')">
              <ColorField v-model="options.background" :label="translate('features.imageGenerator.form.background')" />
            </UFormField>
            <UFormField :label="translate('features.imageGenerator.form.foreground')">
              <ColorField v-model="options.foreground" :label="translate('features.imageGenerator.form.foreground')" />
            </UFormField>
          </div>
        </form>

        <!-- Preview -->
        <section class="space-y-3 lg:sticky lg:top-0" :aria-label="translate('features.imageGenerator.preview.label')">
          <div
            class="relative flex min-h-72 items-center justify-center overflow-hidden rounded-lg p-4 ring ring-default [background-image:repeating-conic-gradient(var(--ui-bg-elevated)_0%_25%,var(--ui-bg)_0%_50%)] [background-size:20px_20px]"
          >
            <img
              :key="previewUrl"
              :src="previewUrl"
              :alt="translate('features.imageGenerator.preview.alt', { width: clampDimension(options.width), height: clampDimension(options.height) })"
              class="max-h-[60vh] max-w-full rounded shadow-sm transition-opacity"
              :class="previewState === 'ready' ? 'opacity-100' : 'opacity-40'"
              @load="previewState = 'ready'"
              @error="previewState = 'error'"
            />

            <span
              v-if="previewState === 'loading'"
              class="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-default/90 px-3 py-1 text-xs text-muted"
              role="status"
            >
              {{ translate("features.imageGenerator.preview.loading") }}
            </span>
          </div>

          <UAlert
            v-if="previewState === 'error'"
            color="error"
            variant="subtle"
            icon="i-lucide-image-off"
            :title="translate('features.imageGenerator.preview.error')"
          />

          <UFormField :label="translate('features.imageGenerator.preview.url')">
            <UFieldGroup class="w-full">
              <UInput
                :model-value="imageUrl"
                readonly
                variant="outline"
                size="md"
                class="flex-1"
                :ui="{ base: 'font-mono text-xs' }"
                @focus="($event.target as HTMLInputElement).select()"
              />
              <UButton
                :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                color="neutral"
                variant="subtle"
                size="md"
                class="!rounded-l-none"
                :label="translate('features.imageGenerator.preview.copy')"
                @click="copyUrl"
              />
            </UFieldGroup>
          </UFormField>

          <div class="flex flex-wrap justify-end gap-2">
            <UButton
              :href="imageUrl"
              target="_blank"
              rel="noopener"
              icon="i-lucide-external-link"
              color="neutral"
              variant="outline"
              size="md"
              :label="translate('features.imageGenerator.preview.open')"
            />
            <UButton
              icon="i-lucide-download"
              size="md"
              :loading="isDownloading"
              :label="translate('features.imageGenerator.preview.download')"
              @click="download"
            />
          </div>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
