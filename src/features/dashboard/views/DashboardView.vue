<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

import { translate } from "@/plugins/language";
import { getApiErrorMessage } from "@/shared/helpers/error";
import { formatCurrency, formatNumber } from "@/shared/helpers/number";

import { customerQueryKeys, getCustomerCount } from "@/features/customers/services/api";
import { summarizeOrders, topOrdersByRevenue } from "@/features/orders/helpers/order-summary";
import { OrdersPageName } from "@/features/orders/models";
import { getAllOrders, orderQueryKeys } from "@/features/orders/services/api";
import { inventoryValueByCategory, lowStockProducts } from "@/features/products/helpers/inventory";
import { LOW_STOCK_THRESHOLD, ProductsPageName } from "@/features/products/models";
import {
  getAllProducts,
  getProductCategories,
  productQueryKeys,
} from "@/features/products/services/api";

import InventoryByCategoryChart from "../components/InventoryByCategoryChart.vue";

const CHART_CATEGORY_COUNT = 8;
const LIST_LENGTH = 5;

const ordersQuery = useQuery({ queryKey: orderQueryKeys.everything(), queryFn: getAllOrders });
const productsQuery = useQuery({ queryKey: productQueryKeys.catalogue(), queryFn: getAllProducts });
const customerCountQuery = useQuery({
  queryKey: customerQueryKeys.count(),
  queryFn: getCustomerCount,
});
const categoriesQuery = useQuery({
  queryKey: productQueryKeys.categories(),
  queryFn: getProductCategories,
  staleTime: Infinity,
});

const orders = computed(() => ordersQuery.data.value?.carts ?? []);
const products = computed(() => productsQuery.data.value?.products ?? []);

const orderSummary = computed(() => summarizeOrders(orders.value));
const largestOrders = computed(() => topOrdersByRevenue(orders.value, LIST_LENGTH));
const inventory = computed(() => inventoryValueByCategory(products.value, CHART_CATEGORY_COUNT));
const runningLow = computed(() => lowStockProducts(products.value, LIST_LENGTH));

const categoryNames = computed(
  () => new Map((categoriesQuery.data.value ?? []).map((item) => [item.slug, item.name])),
);
const categoryName = (slug: string) => categoryNames.value.get(slug) ?? slug;

const figures = computed(() => [
  {
    label: translate("features.dashboard.figures.revenue"),
    value: formatCurrency(orderSummary.value.revenue),
    note: translate("features.dashboard.figures.revenue_note", {
      amount: formatCurrency(orderSummary.value.discounts),
    }),
    loading: ordersQuery.isPending.value,
  },
  {
    label: translate("features.dashboard.figures.orders"),
    value: formatNumber(orderSummary.value.count),
    note: translate("features.dashboard.figures.orders_note", {
      units: formatNumber(orderSummary.value.units),
    }),
    loading: ordersQuery.isPending.value,
  },
  {
    label: translate("features.dashboard.figures.average_order"),
    value: formatCurrency(orderSummary.value.averageOrderValue),
    note: translate("features.dashboard.figures.average_order_note"),
    loading: ordersQuery.isPending.value,
  },
  {
    label: translate("features.dashboard.figures.customers"),
    value: formatNumber(customerCountQuery.data.value ?? 0),
    note: translate("features.dashboard.figures.customers_note"),
    loading: customerCountQuery.isPending.value,
  },
]);

const failedQueries = computed(() =>
  [ordersQuery, productsQuery, customerCountQuery].filter((query) => query.error.value),
);

const retryFailed = () => failedQueries.value.forEach((query) => query.refetch());
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar :title="translate('features.dashboard.page_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UAlert
        v-if="failedQueries.length"
        class="shrink-0"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="translate('features.dashboard.load_error_title')"
        :description="
          getApiErrorMessage(failedQueries[0]?.error.value, translate('utils.common.load_error'))
        "
        :actions="[
          {
            label: translate('utils.common.try_again'),
            color: 'error',
            variant: 'outline',
            onClick: retryFailed,
          },
        ]"
      />

      <!-- Headline figures: one continuous band rather than separate cards. -->
      <dl
        class="grid shrink-0 grid-cols-2 overflow-hidden rounded-lg border border-default lg:grid-cols-4 [&>div]:border-default max-lg:[&>div:nth-child(-n+2)]:border-b max-lg:[&>div:nth-child(odd)]:border-r lg:[&>div:not(:last-child)]:border-r"
      >
        <div v-for="figure in figures" :key="figure.label" class="px-5 py-4">
          <dt class="text-sm text-muted">{{ figure.label }}</dt>
          <dd class="mt-2">
            <USkeleton v-if="figure.loading" class="h-8 w-28" />
            <span
              v-else
              class="block text-2xl font-semibold tracking-tight text-highlighted tabular-nums sm:text-3xl"
            >
              {{ figure.value }}
            </span>
            <span class="mt-1 block text-xs text-dimmed">{{ figure.note }}</span>
          </dd>
        </div>
      </dl>

      <div class="grid shrink-0 gap-4 lg:grid-cols-3">
        <UCard class="lg:col-span-2" :ui="{ header: 'pb-0 sm:pb-0 border-0' }">
          <template #header>
            <h2 class="font-semibold text-highlighted">
              {{ translate("features.dashboard.inventory.title") }}
            </h2>
            <p class="text-sm text-muted">
              {{
                translate("features.dashboard.inventory.description", {
                  count: CHART_CATEGORY_COUNT,
                })
              }}
            </p>
          </template>

          <USkeleton v-if="productsQuery.isPending.value" class="h-75 w-full" />
          <InventoryByCategoryChart v-else :data="inventory" :category-name="categoryName" />
        </UCard>

        <UCard :ui="{ body: 'flex-1', root: 'flex flex-col' }">
          <template #header>
            <div class="flex items-start justify-between gap-2">
              <div>
                <h2 class="font-semibold text-highlighted">
                  {{ translate("features.dashboard.low_stock.title") }}
                </h2>
                <p class="text-sm text-muted">
                  {{
                    translate("features.dashboard.low_stock.description", {
                      threshold: LOW_STOCK_THRESHOLD,
                    })
                  }}
                </p>
              </div>
              <UButton
                :to="{ name: ProductsPageName.PRODUCTS_LIST }"
                :label="translate('features.dashboard.low_stock.view_all')"
                trailing-icon="i-lucide-arrow-up-right"
                color="neutral"
                variant="ghost"
                size="sm"
              />
            </div>
          </template>

          <div v-if="productsQuery.isPending.value" class="space-y-4">
            <USkeleton v-for="index in LIST_LENGTH" :key="index" class="h-9 w-full" />
          </div>

          <p v-else-if="!runningLow.length" class="text-sm text-muted">
            {{
              translate("features.dashboard.low_stock.all_stocked", {
                threshold: LOW_STOCK_THRESHOLD,
              })
            }}
          </p>

          <ul v-else class="space-y-4">
            <li v-for="product in runningLow" :key="product.id" class="flex items-center gap-3">
              <img
                :src="product.thumbnail"
                alt=""
                class="size-9 shrink-0 rounded bg-elevated object-contain"
                loading="lazy"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-2 text-sm">
                  <span class="truncate text-default">{{ product.title }}</span>
                  <span
                    class="shrink-0 tabular-nums"
                    :class="
                      product.stock <= LOW_STOCK_THRESHOLD / 2 ? 'text-error' : 'text-warning'
                    "
                  >
                    {{
                      translate("features.dashboard.low_stock.units_left", { count: product.stock })
                    }}
                  </span>
                </div>
                <UProgress
                  :model-value="product.stock"
                  :max="LOW_STOCK_THRESHOLD"
                  size="xs"
                  :color="product.stock <= LOW_STOCK_THRESHOLD / 2 ? 'error' : 'warning'"
                  class="mt-1.5"
                />
              </div>
            </li>
          </ul>
        </UCard>
      </div>

      <UCard class="shrink-0" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-semibold text-highlighted">
              {{ translate("features.dashboard.top_orders.title") }}
            </h2>
            <UButton
              :to="{ name: OrdersPageName.ORDERS_LIST }"
              :label="translate('features.dashboard.top_orders.view_all')"
              trailing-icon="i-lucide-arrow-up-right"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </div>
        </template>

        <div v-if="ordersQuery.isPending.value" class="space-y-3 p-4">
          <USkeleton v-for="index in LIST_LENGTH" :key="index" class="h-10 w-full" />
        </div>

        <ol v-else class="divide-y divide-default">
          <li
            v-for="order in largestOrders"
            :key="order.id"
            class="flex items-center gap-4 px-4 py-3 sm:px-6"
          >
            <span class="w-12 shrink-0 text-sm font-medium text-muted tabular-nums">
              {{ translate("features.orders.table.order_number", { id: order.id }) }}
            </span>
            <UAvatarGroup size="xs" :max="4" class="shrink-0">
              <UAvatar
                v-for="line in order.products"
                :key="line.id"
                :src="line.thumbnail"
                :alt="line.title"
                class="bg-elevated"
              />
            </UAvatarGroup>
            <span class="hidden flex-1 truncate text-sm text-toned sm:block">
              {{ order.products.map((line) => line.title).join(", ") }}
            </span>
            <span class="ml-auto shrink-0 text-right">
              <span class="block text-sm font-semibold text-highlighted tabular-nums">
                {{ formatCurrency(order.discountedTotal) }}
              </span>
              <span class="block text-xs text-muted tabular-nums">
                {{
                  translate("features.dashboard.top_orders.items", { count: order.totalQuantity })
                }}
              </span>
            </span>
          </li>
        </ol>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
