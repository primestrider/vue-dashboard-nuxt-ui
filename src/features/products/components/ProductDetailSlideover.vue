<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui"
import { useQuery } from "@tanstack/vue-query"
import { computed } from "vue"

import { translate } from "@/plugins/language"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import { useDateFormatter } from "@/shared/composables/useDateFormatter"
import { formatCurrency } from "@/shared/helpers/number"

import { getProduct, productQueryKeys } from "../services/api"

/**
 * Read-only product detail panel, opened through `useOverlay`.
 */
const { productId } = defineProps<{
  productId: number
}>()

const { formatDate } = useDateFormatter()

const { data: product, isPending, error, refetch } = useQuery({
  queryKey: computed(() => productQueryKeys.detail(productId)),
  queryFn: () => getProduct(productId),
})

const discountedPrice = computed(() => {
  if (!product.value) return 0
  return product.value.price * (1 - product.value.discountPercentage / 100)
})

const facts = computed(() => {
  if (!product.value) return []

  return [
    { label: translate("features.products.detail.sku"), value: product.value.sku },
    { label: translate("features.products.detail.brand"), value: product.value.brand ?? "-" },
    { label: translate("features.products.detail.availability"), value: product.value.availabilityStatus },
    { label: translate("features.products.detail.minimum_order"), value: String(product.value.minimumOrderQuantity) },
    { label: translate("features.products.detail.warranty"), value: product.value.warrantyInformation },
    { label: translate("features.products.detail.shipping"), value: product.value.shippingInformation },
    { label: translate("features.products.detail.return_policy"), value: product.value.returnPolicy },
  ]
})

const tabs = computed<TabsItem[]>(() => [
  { label: translate("features.products.detail.tab_overview"), slot: "overview" as const, value: "overview" },
  {
    label: translate("features.products.detail.tab_reviews", { count: product.value?.reviews.length ?? 0 }),
    slot: "reviews" as const,
    value: "reviews",
  },
])
</script>

<template>
  <USlideover
    :title="product?.title ?? translate('features.products.detail.title')"
    :description="product?.category"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <div v-if="isPending" class="space-y-4">
        <USkeleton class="aspect-square w-full rounded-lg" />
        <USkeleton class="h-6 w-2/3" />
        <USkeleton class="h-20 w-full" />
      </div>

      <QueryErrorAlert
        v-else-if="error"
        :title="translate('features.products.load_error_title')"
        :error="error"
        @retry="refetch()"
        />

      <div v-else-if="product" class="space-y-6">
        <UCarousel
          v-slot="{ item }"
          :items="product.images"
          dots
          :arrows="product.images.length > 1"
          class="rounded-lg bg-elevated"
          :ui="{ dots: 'bottom-3' }"
        >
          <img :src="item" :alt="product.title" class="aspect-square w-full object-contain" loading="lazy" />
        </UCarousel>

        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-3xl font-semibold tracking-tight text-highlighted tabular-nums">
              {{ formatCurrency(discountedPrice) }}
            </p>
            <p v-if="product.discountPercentage > 0" class="text-sm text-muted tabular-nums">
              <s>{{ formatCurrency(product.price) }}</s>
              <span class="ml-1.5 text-success">−{{ product.discountPercentage }}%</span>
            </p>
          </div>

          <div class="text-right text-sm">
            <p class="flex items-center justify-end gap-1 font-medium text-highlighted tabular-nums">
              <UIcon name="i-lucide-star" class="size-4 text-warning" />
              {{ product.rating.toFixed(1) }}
            </p>
            <p class="text-muted tabular-nums">
              {{ translate("features.products.detail.in_stock_units", { count: product.stock }) }}
            </p>
          </div>
        </div>

        <UTabs :items="tabs" default-value="overview" variant="link" class="w-full">
          <template #overview>
            <p class="mb-5 text-sm leading-relaxed text-toned">{{ product.description }}</p>

            <div v-if="product.tags.length" class="mb-5 flex flex-wrap gap-1.5">
              <UBadge v-for="tag in product.tags" :key="tag" :label="tag" color="neutral" variant="subtle" />
            </div>

            <dl class="divide-y divide-default text-sm">
              <div v-for="fact in facts" :key="fact.label" class="grid grid-cols-5 gap-3 py-2.5">
                <dt class="col-span-2 text-muted">{{ fact.label }}</dt>
                <dd class="col-span-3 text-default">{{ fact.value }}</dd>
              </div>
            </dl>
          </template>

          <template #reviews>
            <p v-if="!product.reviews.length" class="text-sm text-muted">
              {{ translate("features.products.detail.no_reviews") }}
            </p>

            <ul v-else class="divide-y divide-default">
              <li v-for="review in product.reviews" :key="review.reviewerEmail + review.date" class="py-4">
                <div class="flex items-center justify-between gap-3">
                  <UUser :name="review.reviewerName" :description="formatDate(review.date)" size="sm" />
                  <span class="flex items-center gap-0.5" :aria-label="`${review.rating} / 5`">
                    <UIcon
                      v-for="star in 5"
                      :key="star"
                      name="i-lucide-star"
                      class="size-3.5"
                      :class="star <= review.rating ? 'text-warning' : 'text-dimmed'"
                    />
                  </span>
                </div>
                <p class="mt-2 text-sm text-toned">{{ review.comment }}</p>
              </li>
            </ul>
          </template>
        </UTabs>
      </div>
    </template>
  </USlideover>
</template>
