<script setup lang="ts">
import type { ExpandedState } from "@tanstack/vue-table"
import type { TableColumn } from "@nuxt/ui"
import { keepPreviousData, useQuery } from "@tanstack/vue-query"
import { computed, ref, watch } from "vue"

import { translate } from "@/plugins/language"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import DataTablePagination from "@/shared/components/DataTablePagination.vue"
import { useRouteQueryState } from "@/shared/composables/useRouteQueryState"
import { paginationParams } from "@/shared/helpers/query-param"
import { formatCurrency } from "@/shared/helpers/number"

import type { CustomerSummary } from "@/features/customers/models"
import { customerQueryKeys, getCustomerDirectory } from "@/features/customers/services/api"

import type { Order, OrderListParams } from "../models"
import { getOrders, orderQueryKeys } from "../services/api"

type OrderRow = Order & { customer?: CustomerSummary }

// Pagination is kept in the URL so a refresh stays on the same page.
const { page, limit } = useRouteQueryState(paginationParams())
const expanded = ref<ExpandedState>({})

const listParams = computed<OrderListParams>(() => ({ page: page.value, limit: limit.value }))

// Collapse rows when the page changes; expanded state is keyed by row index.
watch(listParams, () => {
  expanded.value = {}
})

const { data: orderPage, isFetching, error, refetch } = useQuery({
  queryKey: computed(() => orderQueryKeys.list(listParams.value)),
  queryFn: () => getOrders(listParams.value),
  placeholderData: keepPreviousData,
})

const { data: customers } = useQuery({
  queryKey: customerQueryKeys.directory(),
  queryFn: getCustomerDirectory,
  staleTime: Infinity,
})

/** Order rows joined with the customer who placed them. */
const rows = computed<OrderRow[]>(() => {
  const customersById = new Map((customers.value ?? []).map((customer) => [customer.id, customer]))

  return (orderPage.value?.carts ?? []).map((order) => ({
    ...order,
    customer: customersById.get(order.userId),
  }))
})

const numericCell = { class: { th: "text-right", td: "text-right tabular-nums" } }

const columns: TableColumn<OrderRow>[] = [
  { id: "expand", header: () => "", meta: { class: { td: "w-px" } } },
  { accessorKey: "id", header: translate("features.orders.table.order") },
  { accessorKey: "userId", header: translate("features.orders.table.customer") },
  { accessorKey: "totalQuantity", header: translate("features.orders.table.items") },
  { accessorKey: "total", header: translate("features.orders.table.subtotal"), meta: numericCell },
  { id: "discount", header: translate("features.orders.table.discount"), meta: numericCell },
  { accessorKey: "discountedTotal", header: translate("features.orders.table.total"), meta: numericCell },
]
</script>

<template>
  <UDashboardPanel id="orders">
    <template #header>
      <UDashboardNavbar :title="translate('features.orders.page_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <QueryErrorAlert
        v-if="error"
        :title="translate('features.orders.load_error_title')"
        :error="error"
        @retry="refetch()"
        />

      <UTable
        v-else
        v-model:expanded="expanded"
        :data="rows"
        :columns="columns"
        :loading="isFetching"
        sticky="header"
        class="flex-1"
        :ui="{ td: 'py-3', tr: 'data-[expanded=true]:bg-elevated/50' }"
      >
        <template #expand-cell="{ row }">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-chevron-right"
            :aria-label="row.getIsExpanded() ? translate('features.orders.table.hide_items') : translate('features.orders.table.show_items')"
            :aria-expanded="row.getIsExpanded()"
            :ui="{ leadingIcon: ['transition-transform', row.getIsExpanded() ? 'rotate-90' : ''] }"
            @click="row.toggleExpanded()"
          />
        </template>

        <template #id-cell="{ row }">
          <span class="font-medium text-highlighted tabular-nums">
            {{ translate("features.orders.table.order_number", { id: row.original.id }) }}
          </span>
        </template>

        <template #userId-cell="{ row }">
          <UUser
            v-if="row.original.customer"
            :name="`${row.original.customer.firstName} ${row.original.customer.lastName}`"
            :description="row.original.customer.email"
            :avatar="{ src: row.original.customer.image, alt: '' }"
            size="sm"
          />
          <span v-else class="text-muted">
            {{ translate("features.orders.table.unknown_customer", { id: row.original.userId }) }}
          </span>
        </template>

        <template #totalQuantity-cell="{ row }">
          <span class="text-toned tabular-nums">
            {{
              translate("features.orders.table.products_units", {
                products: row.original.totalProducts,
                units: row.original.totalQuantity,
              })
            }}
          </span>
        </template>

        <template #total-cell="{ row }">
          <span class="text-muted">{{ formatCurrency(row.original.total) }}</span>
        </template>

        <template #discount-cell="{ row }">
          <span class="text-success">−{{ formatCurrency(row.original.total - row.original.discountedTotal) }}</span>
        </template>

        <template #discountedTotal-cell="{ row }">
          <span class="font-semibold text-highlighted">{{ formatCurrency(row.original.discountedTotal) }}</span>
        </template>

        <template #expanded="{ row }">
          <table class="w-full text-sm">
            <thead class="text-left text-xs text-muted">
              <tr>
                <th class="py-2 pl-12 font-medium">{{ translate("features.orders.line.product") }}</th>
                <th class="py-2 text-right font-medium">{{ translate("features.orders.line.quantity") }}</th>
                <th class="py-2 text-right font-medium">{{ translate("features.orders.line.unit_price") }}</th>
                <th class="py-2 pr-4 text-right font-medium">{{ translate("features.orders.line.total") }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="line in row.original.products" :key="line.id">
                <td class="py-2 pl-12">
                  <div class="flex items-center gap-3">
                    <img :src="line.thumbnail" alt="" class="size-9 rounded bg-default object-contain" loading="lazy" />
                    <span class="text-default">{{ line.title }}</span>
                  </div>
                </td>
                <td class="py-2 text-right tabular-nums">{{ line.quantity }}</td>
                <td class="py-2 text-right tabular-nums text-muted">{{ formatCurrency(line.price) }}</td>
                <td class="py-2 pr-4 text-right tabular-nums text-highlighted">
                  {{ formatCurrency(line.discountedTotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>

        <template #empty>
          <UEmpty
            icon="i-lucide-shopping-cart"
            :title="translate('features.orders.table.empty_title')"
            :description="translate('features.orders.table.empty_description')"
            variant="naked"
          />
        </template>
      </UTable>

      <DataTablePagination v-if="!error" v-model:page="page" v-model:limit="limit" :total="orderPage?.total ?? 0" />
    </template>
  </UDashboardPanel>
</template>
