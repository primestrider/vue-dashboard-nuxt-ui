<script setup lang="ts">
import type { DropdownMenuItem, TableColumn, TableRow } from "@nuxt/ui"
import { useOverlay } from "@nuxt/ui/composables"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { computed } from "vue"

import { translate } from "@/plugins/language"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import SearchInput from "@/shared/components/SearchInput.vue"
import { useAppToast } from "@/plugins/nuxt-ui/toaster"
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue"
import { useDebouncedQueryModel, useRouteQueryState } from "@/shared/composables/useRouteQueryState"
import {
  literalParam,
  paginationParams,
  slugParam,
  stringParam,
  withAllowList,
} from "@/shared/helpers/query-param"
import DataTablePagination from "@/shared/components/DataTablePagination.vue"
import { getApiErrorMessage } from "@/shared/helpers/error"
import { prependToList, removeFromList, replaceInList } from "@/shared/helpers/list-cache"
import { formatCurrency } from "@/shared/helpers/number"
import { Permission } from "@/shared/models/access"
import { useAccessStore } from "@/shared/stores/useAccessStore"

import ProductDetailSlideover from "../components/ProductDetailSlideover.vue"
import ProductFormModal from "../components/ProductFormModal.vue"
import { toProductListItem } from "../helpers/list-cache"
import { LOW_STOCK_THRESHOLD, type ProductListItem, type ProductListParams, type ProductSortField } from "../models"
import {
  deleteProduct,
  getProductCategories,
  getProducts,
  productQueryKeys,
  type ProductListResponse,
} from "../services/api"

type SortKey = "title_asc" | "price_asc" | "price_desc" | "rating_desc" | "stock_asc"

const SORT_OPTIONS: Record<SortKey, { sortBy: ProductSortField; order: "asc" | "desc" }> = {
  title_asc: { sortBy: "title", order: "asc" },
  price_asc: { sortBy: "price", order: "asc" },
  price_desc: { sortBy: "price", order: "desc" },
  rating_desc: { sortBy: "rating", order: "desc" },
  stock_asc: { sortBy: "stock", order: "asc" },
}

const queryClient = useQueryClient()
const overlay = useOverlay()
const accessStore = useAccessStore()
const { showToast } = useAppToast()

const canWrite = computed(() => accessStore.hasPermission(Permission.PRODUCTS_WRITE))

const { data: categories } = useQuery({
  queryKey: productQueryKeys.categories(),
  queryFn: getProductCategories,
  staleTime: Infinity,
})

// ---- Filters (kept in the URL) ---------------------------------------------
const {
  page,
  limit,
  q: search,
  category,
  sort: sortKey,
} = useRouteQueryState(
  {
    ...paginationParams(),
    q: stringParam({ maxLength: 100 }),
    category: withAllowList(slugParam(), () => categories.value?.map((item) => item.slug)),
    sort: literalParam(Object.keys(SORT_OPTIONS) as SortKey[], "title_asc"),
  },
  { resetKey: "page" },
)

const searchInput = useDebouncedQueryModel(search)

const listParams = computed<ProductListParams>(() => ({
  page: page.value,
  limit: limit.value,
  search: search.value,
  category: category.value,
  ...SORT_OPTIONS[sortKey.value],
}))

const sortItems = computed(() =>
  (Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => ({
    label: translate(`features.products.filters.sort.${key}`),
    value: key,
  })),
)

// ---- Queries -------------------------------------------------------------
const { data: productPage, isFetching, error, refetch } = useQuery({
  queryKey: computed(() => productQueryKeys.list(listParams.value)),
  queryFn: () => getProducts(listParams.value),
  placeholderData: keepPreviousData,
})

const categoryItems = computed(() => [
  { label: translate("features.products.filters.all_categories"), value: "" },
  ...(categories.value ?? []).map((item) => ({ label: item.name, value: item.slug })),
])

const categoryNames = computed(
  () => new Map((categories.value ?? []).map((item) => [item.slug, item.name])),
)

/** Applies an updater to every cached list page (all filters and pages). */
function patchCachedLists(updater: (list: ProductListResponse | undefined) => ProductListResponse | undefined) {
  queryClient.setQueriesData<ProductListResponse>({ queryKey: productQueryKeys.lists() }, updater)
}

// ---- Overlays ------------------------------------------------------------
const detailSlideover = overlay.create(ProductDetailSlideover)
const formModal = overlay.create(ProductFormModal)
const confirmDialog = overlay.create(ConfirmDialog)

const openDetail = (product: ProductListItem) => detailSlideover.open({ productId: product.id })

async function openCreate() {
  const created = await formModal.open({ categories: categories.value ?? [] }).result
  if (!created) return

  queryClient.setQueryData<ProductListResponse>(productQueryKeys.list(listParams.value), (list) =>
    prependToList(list, "products", toProductListItem(created)),
  )
  showToast.success({
    title: translate("features.products.toast.created"),
    description: translate("utils.common.simulated_write"),
  })
}

async function openEdit(product: ProductListItem) {
  const updated = await formModal.open({ productId: product.id, categories: categories.value ?? [] }).result
  if (!updated) return

  patchCachedLists((list) => replaceInList(list, "products", toProductListItem(updated)))
  queryClient.setQueryData(productQueryKeys.detail(product.id), updated)
  showToast.success({
    title: translate("features.products.toast.updated"),
    description: translate("utils.common.simulated_write"),
  })
}

const { mutate: removeProduct } = useMutation({
  mutationFn: deleteProduct,
  onSuccess: (deleted) => {
    patchCachedLists((list) => removeFromList(list, "products", deleted.id))
    showToast.success({
      title: translate("features.products.toast.deleted"),
      description: translate("utils.common.simulated_write"),
    })
  },
  onError: (mutationError) => {
    showToast.error({
      title: translate("features.products.toast.failed"),
      description: getApiErrorMessage(mutationError),
    })
  },
})

async function confirmDelete(product: ProductListItem) {
  const confirmed = await confirmDialog.open({
    title: translate("features.products.delete.title", { title: product.title }),
    description: translate("features.products.delete.description"),
    confirmLabel: translate("features.products.delete.confirm"),
  }).result

  if (confirmed) removeProduct(product.id)
}

// ---- Table ---------------------------------------------------------------
const columns: TableColumn<ProductListItem>[] = [
  { accessorKey: "title", header: translate("features.products.table.product") },
  { accessorKey: "category", header: translate("features.products.table.category") },
  { accessorKey: "price", header: translate("features.products.table.price"), meta: { class: { th: "text-right", td: "text-right" } } },
  { accessorKey: "stock", header: translate("features.products.table.stock"), meta: { class: { th: "text-right", td: "text-right" } } },
  { accessorKey: "rating", header: translate("features.products.table.rating"), meta: { class: { th: "text-right", td: "text-right" } } },
  { id: "actions", header: () => "", meta: { class: { td: "w-px" } } },
]

function rowActions(product: ProductListItem): DropdownMenuItem[][] {
  const view: DropdownMenuItem = {
    label: translate("features.products.actions.view"),
    icon: "i-lucide-eye",
    onSelect: () => openDetail(product),
  }

  if (!canWrite.value) return [[view]]

  return [
    [view, { label: translate("features.products.actions.edit"), icon: "i-lucide-pencil", onSelect: () => openEdit(product) }],
    [{ label: translate("features.products.actions.delete"), icon: "i-lucide-trash-2", color: "error", onSelect: () => confirmDelete(product) }],
  ]
}

const onRowSelect = (_event: Event, row: TableRow<ProductListItem>) => openDetail(row.original)

const hasActiveFilters = computed(() => Boolean(search.value || category.value))
const clearFilters = () => {
  search.value = ""
  category.value = ""
}
</script>

<template>
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar :title="translate('features.products.page_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            v-if="canWrite"
            icon="i-lucide-plus"
            size="md"
            :label="translate('features.products.add_product')"
            @click="openCreate"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <SearchInput v-model="searchInput" :placeholder="translate('features.products.filters.search_placeholder')" />
        </template>

        <template #right>
          <UTooltip :text="translate('features.products.filters.category_locked')" :disabled="!search">
            <USelectMenu
              v-model="category"
              :items="categoryItems"
              value-key="value"
              size="md"
              variant="outline"
              :disabled="Boolean(search)"
              class="!w-48"
            />
          </UTooltip>

          <USelect v-model="sortKey" :items="sortItems" size="md" variant="outline" class="!w-48" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <QueryErrorAlert
        v-if="error"
        :title="translate('features.products.load_error_title')"
        :error="error"
        @retry="refetch()"
        />

      <UTable
        v-else
        :data="productPage?.products ?? []"
        :columns="columns"
        :loading="isFetching"
        :on-select="onRowSelect"
        sticky="header"
        class="flex-1"
        :ui="{ tr: 'cursor-pointer', td: 'py-3' }"
      >
        <template #title-cell="{ row }">
          <div class="flex min-w-56 items-center gap-3">
            <img
              :src="row.original.thumbnail"
              alt=""
              class="size-11 shrink-0 rounded-md bg-elevated object-contain"
              loading="lazy"
            />
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">{{ row.original.title }}</p>
              <p v-if="row.original.brand" class="truncate text-xs text-muted">{{ row.original.brand }}</p>
            </div>
          </div>
        </template>

        <template #category-cell="{ row }">
          <span class="text-toned">
            {{ categoryNames.get(row.original.category) ?? row.original.category }}
          </span>
        </template>

        <template #price-cell="{ row }">
          <span class="font-medium text-highlighted tabular-nums">{{ formatCurrency(row.original.price) }}</span>
          <span v-if="row.original.discountPercentage >= 1" class="block text-xs text-success tabular-nums">
            −{{ Math.round(row.original.discountPercentage) }}%
          </span>
        </template>

        <template #stock-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UBadge
              v-if="row.original.stock === 0"
              :label="translate('features.products.table.out_of_stock')"
              color="error"
              variant="subtle"
              size="sm"
            />
            <UBadge
              v-else-if="row.original.stock <= LOW_STOCK_THRESHOLD"
              :label="translate('features.products.table.low_stock')"
              color="warning"
              variant="subtle"
              size="sm"
            />
            <span class="tabular-nums">{{ row.original.stock }}</span>
          </div>
        </template>

        <template #rating-cell="{ row }">
          <span class="inline-flex items-center gap-1 tabular-nums">
            <UIcon name="i-lucide-star" class="size-3.5 text-warning" />
            {{ row.original.rating.toFixed(1) }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div @click.stop>
            <UDropdownMenu :items="rowActions(row.original)" :content="{ align: 'end' }">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                :aria-label="translate('features.products.table.actions')"
              />
            </UDropdownMenu>
          </div>
        </template>

        <template #empty>
          <UEmpty
            icon="i-lucide-package-search"
            :title="translate('features.products.table.empty_title')"
            :description="translate('features.products.table.empty_description')"
            :actions="hasActiveFilters ? [{ label: translate('utils.common.clear_filters'), icon: 'i-lucide-x', color: 'neutral', variant: 'subtle', onClick: clearFilters }] : []"
            variant="naked"
          />
        </template>
      </UTable>

      <DataTablePagination
        v-if="!error"
        v-model:page="page"
        v-model:limit="limit"
        :total="productPage?.total ?? 0"
      />
    </template>
  </UDashboardPanel>
</template>
