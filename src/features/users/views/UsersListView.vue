<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui"
import { useOverlay } from "@nuxt/ui/composables"
import type { RowSelectionState } from "@tanstack/vue-table"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { computed, h, ref, resolveComponent, watch } from "vue"

import { translate } from "@/plugins/language"
import { useAppToast } from "@/plugins/nuxt-ui/toaster"
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue"
import DataTablePagination from "@/shared/components/DataTablePagination.vue"
import { useDebouncedQueryModel, useRouteQueryState } from "@/shared/composables/useRouteQueryState"
import { literalParam, paginationParams, stringParam } from "@/shared/helpers/query-param"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import SearchInput from "@/shared/components/SearchInput.vue"
import { getApiErrorMessage } from "@/shared/helpers/error"
import { prependToList, removeFromList, replaceInList } from "@/shared/helpers/list-cache"
import { Permission } from "@/shared/models/access"
import { useAccessStore } from "@/shared/stores/useAccessStore"

import { ROLE_BADGE_COLOR } from "@/features/customers/helpers/role"

import UserActivitySlideover from "../components/UserActivitySlideover.vue"
import UserFormModal from "../components/UserFormModal.vue"
import { toUserListItem } from "../helpers/user-list"
import type { UserListItem, UserListParams, UserSortField } from "../models"
import { deleteUsers, getUsers, userQueryKeys, type UserListResponse } from "../services/api"

type SortKey = "firstName_asc" | "username_asc" | "age_asc" | "age_desc"

const SORT_OPTIONS: Record<SortKey, { sortBy: UserSortField; order: "asc" | "desc" }> = {
  firstName_asc: { sortBy: "firstName", order: "asc" },
  username_asc: { sortBy: "username", order: "asc" },
  age_asc: { sortBy: "age", order: "asc" },
  age_desc: { sortBy: "age", order: "desc" },
}

const UCheckbox = resolveComponent("UCheckbox")

const queryClient = useQueryClient()
const overlay = useOverlay()
const accessStore = useAccessStore()
const { showToast } = useAppToast()

const canWrite = computed(() => accessStore.hasPermission(Permission.USERS_WRITE))

// ---- Filters (kept in the URL) ---------------------------------------------
const { page, limit, q: search, sort: sortKey } = useRouteQueryState(
  {
    ...paginationParams(),
    q: stringParam({ maxLength: 100 }),
    sort: literalParam(Object.keys(SORT_OPTIONS) as SortKey[], "firstName_asc"),
  },
  { resetKey: "page" },
)

const searchInput = useDebouncedQueryModel(search)
const rowSelection = ref<RowSelectionState>({})

const listParams = computed<UserListParams>(() => ({
  page: page.value,
  limit: limit.value,
  search: search.value,
  ...SORT_OPTIONS[sortKey.value],
}))

// Selection only makes sense for rows on screen.
watch(listParams, () => {
  rowSelection.value = {}
})

const sortItems = computed(() =>
  (Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => ({
    label: translate(`features.users.filters.sort.${key}`),
    value: key,
  })),
)

// ---- Query ---------------------------------------------------------------
const { data: userPage, isFetching, error, refetch } = useQuery({
  queryKey: computed(() => userQueryKeys.list(listParams.value)),
  queryFn: () => getUsers(listParams.value),
  placeholderData: keepPreviousData,
})

const selectedIds = computed(() =>
  Object.entries(rowSelection.value)
    .filter(([, selected]) => selected)
    .map(([id]) => Number(id)),
)

function patchCachedLists(updater: (list: UserListResponse | undefined) => UserListResponse | undefined) {
  queryClient.setQueriesData<UserListResponse>({ queryKey: userQueryKeys.lists() }, updater)
}

// ---- Overlays & writes ----------------------------------------------------
const activitySlideover = overlay.create(UserActivitySlideover)
const formModal = overlay.create(UserFormModal)
const confirmDialog = overlay.create(ConfirmDialog)

async function openCreate() {
  const created = await formModal.open({}).result
  if (!created) return

  queryClient.setQueryData<UserListResponse>(userQueryKeys.list(listParams.value), (list) =>
    prependToList(list, "users", toUserListItem(created)),
  )
  showToast.success({ title: translate("features.users.toast.created"), description: translate("utils.common.simulated_write") })
}

async function openEdit(user: UserListItem) {
  const updated = await formModal.open({ user }).result
  if (!updated) return

  patchCachedLists((list) => replaceInList(list, "users", toUserListItem(updated)))
  showToast.success({ title: translate("features.users.toast.updated"), description: translate("utils.common.simulated_write") })
}

const { mutate: removeUsers, isPending: isDeleting } = useMutation({
  mutationFn: deleteUsers,
  onSuccess: ({ deleted, failed }) => {
    if (deleted.length) {
      patchCachedLists((list) => removeFromList(list, "users", deleted))
      rowSelection.value = {}
      showToast.success({
        title:
          deleted.length === 1
            ? translate("features.users.toast.deleted")
            : translate("features.users.toast.bulk_deleted", { count: deleted.length }),
        description: translate("utils.common.simulated_write"),
      })
    }

    if (failed.length) {
      showToast.error({ title: translate("features.users.toast.partial_delete", { count: failed.length }) })
    }
  },
  onError: (mutationError) => {
    showToast.error({ title: translate("features.users.toast.failed"), description: getApiErrorMessage(mutationError) })
  },
})

async function confirmDelete(users: UserListItem[]) {
  const [first] = users
  if (!first) return

  const isBulk = users.length > 1
  const confirmed = await confirmDialog.open({
    title: isBulk
      ? translate("features.users.delete.bulk_title", { count: users.length })
      : translate("features.users.delete.title", { name: `${first.firstName} ${first.lastName}` }),
    description: translate("features.users.delete.description"),
    confirmLabel: isBulk ? translate("features.users.delete.bulk_confirm") : translate("features.users.delete.confirm"),
  }).result

  if (confirmed) removeUsers(users.map((user) => user.id))
}

const deleteSelected = () =>
  confirmDelete((userPage.value?.users ?? []).filter((user) => selectedIds.value.includes(user.id)))

// ---- Table ---------------------------------------------------------------
const selectColumn: TableColumn<UserListItem> = {
  id: "select",
  header: ({ table }) =>
    h(UCheckbox, {
      modelValue: table.getIsSomePageRowsSelected() ? "indeterminate" : table.getIsAllPageRowsSelected(),
      "onUpdate:modelValue": (value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value),
      "aria-label": translate("features.users.table.select_all"),
    }),
  cell: ({ row }) =>
    h(UCheckbox, {
      modelValue: row.getIsSelected(),
      "onUpdate:modelValue": (value: boolean | "indeterminate") => row.toggleSelected(!!value),
      "aria-label": translate("features.users.table.select_row", {
        name: `${row.original.firstName} ${row.original.lastName}`,
      }),
    }),
  meta: { class: { th: "w-px", td: "w-px" } },
}

const columns = computed<TableColumn<UserListItem>[]>(() => [
  ...(canWrite.value ? [selectColumn] : []),
  { accessorKey: "firstName", header: translate("features.users.table.user") },
  { accessorKey: "username", header: translate("features.users.table.username") },
  { accessorKey: "phone", header: translate("features.users.table.phone") },
  { accessorKey: "age", header: translate("features.users.table.age"), meta: { class: { th: "text-right", td: "text-right tabular-nums" } } },
  { accessorKey: "role", header: translate("features.users.table.role") },
  { id: "actions", header: () => "", meta: { class: { td: "w-px" } } },
])

function rowActions(user: UserListItem): DropdownMenuItem[][] {
  const view: DropdownMenuItem = {
    label: translate("features.users.actions.view"),
    icon: "i-lucide-activity",
    onSelect: () => activitySlideover.open({ user }),
  }

  if (!canWrite.value) return [[view]]

  return [
    [view, { label: translate("features.users.actions.edit"), icon: "i-lucide-pencil", onSelect: () => openEdit(user) }],
    [{ label: translate("features.users.actions.delete"), icon: "i-lucide-trash-2", color: "error", onSelect: () => confirmDelete([user]) }],
  ]
}
</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar :title="translate('features.users.page_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton v-if="canWrite" icon="i-lucide-user-plus" size="md" :label="translate('features.users.add_user')" @click="openCreate" />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <SearchInput v-model="searchInput" :placeholder="translate('features.users.filters.search_placeholder')" />
        </template>

        <template #right>
          <template v-if="selectedIds.length">
            <span class="text-sm text-muted tabular-nums" aria-live="polite">
              {{ translate("features.users.table.selected", { count: selectedIds.length }) }}
            </span>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="subtle"
              size="md"
              :loading="isDeleting"
              :label="translate('features.users.table.delete_selected')"
              @click="deleteSelected"
            />
          </template>

          <USelect v-model="sortKey" :items="sortItems" size="md" variant="outline" class="!w-44" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <QueryErrorAlert v-if="error" :title="translate('features.users.load_error_title')" :error="error" @retry="refetch()" />

      <UTable
        v-else
        v-model:row-selection="rowSelection"
        :data="userPage?.users ?? []"
        :columns="columns"
        :get-row-id="(row: UserListItem) => String(row.id)"
        :loading="isFetching"
        sticky="header"
        class="flex-1"
        :ui="{ td: 'py-3', tr: 'data-[selected=true]:bg-elevated/50' }"
      >
        <template #firstName-cell="{ row }">
          <UUser
            :name="`${row.original.firstName} ${row.original.lastName}`"
            :description="row.original.email"
            :avatar="{ src: row.original.image || undefined, alt: `${row.original.firstName} ${row.original.lastName}`, class: 'bg-elevated' }"
            class="min-w-56"
          />
        </template>

        <template #username-cell="{ row }">
          <span class="text-toned">@{{ row.original.username }}</span>
        </template>

        <template #phone-cell="{ row }">
          <span class="whitespace-nowrap text-toned tabular-nums">{{ row.original.phone || "-" }}</span>
        </template>

        <template #role-cell="{ row }">
          <UBadge
            :label="translate(`features.customers.roles.${row.original.role}`)"
            :color="ROLE_BADGE_COLOR[row.original.role]"
            variant="subtle"
          />
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu :items="rowActions(row.original)" :content="{ align: 'end' }">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="translate('features.users.table.actions')"
            />
          </UDropdownMenu>
        </template>

        <template #empty>
          <UEmpty
            icon="i-lucide-user-search"
            :title="translate('features.users.table.empty_title')"
            :description="translate('features.users.table.empty_description')"
            variant="naked"
          />
        </template>
      </UTable>

      <DataTablePagination v-if="!error" v-model:page="page" v-model:limit="limit" :total="userPage?.total ?? 0" />
    </template>
  </UDashboardPanel>
</template>
