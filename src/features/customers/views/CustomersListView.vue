<script setup lang="ts">
import type { TableColumn, TableRow, TabsItem } from "@nuxt/ui"
import { useOverlay } from "@nuxt/ui/composables"
import { keepPreviousData, useQuery } from "@tanstack/vue-query"
import { computed, h, resolveComponent } from "vue"

import { translate } from "@/plugins/language"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import SearchInput from "@/shared/components/SearchInput.vue"
import DataTablePagination from "@/shared/components/DataTablePagination.vue"
import { useDebouncedQueryModel, useRouteQueryState } from "@/shared/composables/useRouteQueryState"
import { literalParam, paginationParams, stringParam } from "@/shared/helpers/query-param"

import CustomerDetailSlideover from "../components/CustomerDetailSlideover.vue"
import { ROLE_BADGE_COLOR } from "../helpers/role"
import {
  CUSTOMER_ROLES,
  type CustomerListItem,
  type CustomerListParams,
  type CustomerRole,
  type CustomerSortField,
} from "../models"
import { customerQueryKeys, getCustomers } from "../services/api"

const UButton = resolveComponent("UButton")

const overlay = useOverlay()
const detailSlideover = overlay.create(CustomerDetailSlideover)

// ---- Filters (kept in the URL) ---------------------------------------------
const { page, limit, q: search, role, sort: sortBy, order } = useRouteQueryState(
  {
    ...paginationParams(),
    q: stringParam({ maxLength: 100 }),
    role: literalParam<CustomerRole | "">(["", ...CUSTOMER_ROLES], ""),
    sort: literalParam<CustomerSortField>(["firstName", "age"], "firstName"),
    order: literalParam(["asc", "desc"], "asc"),
  },
  { resetKey: "page" },
)

const searchInput = useDebouncedQueryModel(search)

const listParams = computed<CustomerListParams>(() => ({
  page: page.value,
  limit: limit.value,
  search: search.value,
  role: role.value,
  sortBy: sortBy.value,
  order: order.value,
}))

const roleTabs = computed<TabsItem[]>(() => [
  { label: translate("features.customers.filters.role_all"), value: "" },
  ...CUSTOMER_ROLES.map((item) => ({ label: translate(`features.customers.roles.${item}`), value: item })),
])

// ---- Query ---------------------------------------------------------------
const { data: customerPage, isFetching, error, refetch } = useQuery({
  queryKey: computed(() => customerQueryKeys.list(listParams.value)),
  queryFn: () => getCustomers(listParams.value),
  placeholderData: keepPreviousData,
})

// ---- Table ---------------------------------------------------------------
/** Header button that toggles server-side sorting for one field. */
function sortableHeader(field: CustomerSortField, label: string) {
  return () => {
    const isActive = sortBy.value === field
    const icon = !isActive
      ? "i-lucide-arrow-up-down"
      : order.value === "asc"
        ? "i-lucide-arrow-up-narrow-wide"
        : "i-lucide-arrow-down-wide-narrow"

    return h(UButton, {
      label,
      icon,
      trailing: true,
      color: "neutral",
      variant: "ghost",
      size: "sm",
      class: "-mx-2.5 font-semibold",
      "aria-label": translate("features.customers.table.sort_by", { column: label }),
      onClick: () => {
        if (isActive) {
          order.value = order.value === "asc" ? "desc" : "asc"
        } else {
          sortBy.value = field
          order.value = "asc"
        }
      },
    })
  }
}

const columns: TableColumn<CustomerListItem>[] = [
  { accessorKey: "firstName", header: sortableHeader("firstName", translate("features.customers.table.name")) },
  { accessorKey: "company", header: translate("features.customers.table.company") },
  { accessorKey: "address", header: translate("features.customers.table.location") },
  { accessorKey: "age", header: sortableHeader("age", translate("features.customers.table.age")) },
  { accessorKey: "role", header: translate("features.customers.table.role") },
]

const onRowSelect = (_event: Event, row: TableRow<CustomerListItem>) =>
  detailSlideover.open({ customerId: row.original.id })

const hasActiveFilters = computed(() => Boolean(search.value || role.value))
const clearFilters = () => {
  search.value = ""
  role.value = ""
}
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar :title="translate('features.customers.page_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <SearchInput v-model="searchInput" :placeholder="translate('features.customers.filters.search_placeholder')" />
        </template>

        <template #right>
          <UTooltip :text="translate('features.customers.filters.role_locked')" :disabled="!search">
            <UTabs
              v-model="role"
              :items="roleTabs"
              :content="false"
              size="sm"
              :disabled="Boolean(search)"
              :ui="{ trigger: 'px-3' }"
            />
          </UTooltip>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <QueryErrorAlert
        v-if="error"
        :title="translate('features.customers.load_error_title')"
        :error="error"
        @retry="refetch()"
        />

      <UTable
        v-else
        :data="customerPage?.users ?? []"
        :columns="columns"
        :loading="isFetching"
        :on-select="onRowSelect"
        sticky="header"
        class="flex-1"
        :ui="{ tr: 'cursor-pointer', td: 'py-3' }"
      >
        <template #firstName-cell="{ row }">
          <UUser
            :name="`${row.original.firstName} ${row.original.lastName}`"
            :description="row.original.email"
            :avatar="{ src: row.original.image, alt: '', class: 'bg-elevated' }"
            class="min-w-56"
          />
        </template>

        <template #company-cell="{ row }">
          <p class="text-default">{{ row.original.company.name }}</p>
          <p class="text-xs text-muted">{{ row.original.company.title }}</p>
        </template>

        <template #address-cell="{ row }">
          <span class="text-toned">{{ row.original.address.city }}, {{ row.original.address.state }}</span>
        </template>

        <template #age-cell="{ row }">
          <span class="tabular-nums">{{ row.original.age }}</span>
        </template>

        <template #role-cell="{ row }">
          <UBadge
            :label="translate(`features.customers.roles.${row.original.role}`)"
            :color="ROLE_BADGE_COLOR[row.original.role]"
            variant="subtle"
          />
        </template>

        <template #empty>
          <UEmpty
            icon="i-lucide-user-search"
            :title="translate('features.customers.table.empty_title')"
            :description="translate('features.customers.table.empty_description')"
            :actions="hasActiveFilters ? [{ label: translate('utils.common.clear_filters'), icon: 'i-lucide-x', color: 'neutral', variant: 'subtle', onClick: clearFilters }] : []"
            variant="naked"
          />
        </template>
      </UTable>

      <DataTablePagination
        v-if="!error"
        v-model:page="page"
        v-model:limit="limit"
        :total="customerPage?.total ?? 0"
      />
    </template>
  </UDashboardPanel>
</template>
