<script setup lang="ts">
import { StackedBar } from "@unovis/ts"
import { VisAxis, VisStackedBar, VisTooltip, VisXYContainer } from "@unovis/vue"

import { translate } from "@/plugins/language"
import { formatCurrency, formatNumber } from "@/shared/helpers/number"

import type { CategoryInventory } from "@/features/products/helpers/inventory"

/**
 * Vertical bar chart of stock value per product category.
 *
 * @remarks
 * A visually hidden list mirrors the bars for screen readers.
 */
const { data, categoryName } = defineProps<{
  data: CategoryInventory[]
  /** Resolves a category slug to its display name. */
  categoryName: (slug: string) => string
}>()

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const x = (_: CategoryInventory, index: number) => index
const y = (item: CategoryInventory) => item.value
const color = () => "var(--ui-primary)"

const xTickFormat = (index: number | Date) => categoryName(data[Number(index)]?.category ?? "")
const yTickFormat = (value: number | Date) => compactCurrency.format(Number(value))

const tooltipTriggers = {
  [StackedBar.selectors.bar]: (item: CategoryInventory) => `
    <p class="font-medium">${escapeHtml(categoryName(item.category))}</p>
    <p class="tabular-nums">${formatCurrency(item.value)}</p>
    <p class="text-muted">${escapeHtml(
      translate("features.dashboard.inventory.tooltip_units", {
        units: formatNumber(item.units),
        products: item.products,
      }),
    )}</p>`,
}
</script>

<template>
  <div class="inventory-chart">
    <VisXYContainer :data="data" :height="300" :padding="{ top: 8 }">
      <VisStackedBar
        :x="x"
        :y="y"
        :color="color"
        :bar-padding="0.35"
        :rounded-corners="4"
      />
      <VisAxis
        type="x"
        :tick-format="xTickFormat"
        :num-ticks="data.length"
        :tick-values="data.map((_, index) => index)"
        tick-text-fit-mode="wrap"
        :tick-text-width="80"
        :grid-line="false"
        :domain-line="false"
      />
      <VisAxis type="y" :tick-format="yTickFormat" :num-ticks="4" :domain-line="false" :tick-line="false" />
      <VisTooltip :triggers="tooltipTriggers" />
    </VisXYContainer>

    <ul class="sr-only">
      <li v-for="item in data" :key="item.category">
        {{ categoryName(item.category) }}: {{ formatCurrency(item.value) }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.inventory-chart {
  --vis-font-family: var(--font-sans);
  --vis-axis-tick-label-color: var(--ui-text-muted);
  --vis-axis-tick-label-font-size: 11px;
  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-domain-color: var(--ui-border);
  --vis-tooltip-background-color: var(--ui-bg-elevated);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text);
  --vis-tooltip-padding: 8px 12px;
  --vis-tooltip-border-radius: 8px;
}
</style>
