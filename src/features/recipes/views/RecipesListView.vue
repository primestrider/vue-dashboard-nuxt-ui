<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui"
import { useOverlay } from "@nuxt/ui/composables"
import { keepPreviousData, useQuery } from "@tanstack/vue-query"
import { computed } from "vue"

import { translate } from "@/plugins/language"
import DataTablePagination from "@/shared/components/DataTablePagination.vue"
import { useDebouncedQueryModel, useRouteQueryState } from "@/shared/composables/useRouteQueryState"
import { literalParam, paginationParams, stringParam } from "@/shared/helpers/query-param"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import SearchInput from "@/shared/components/SearchInput.vue"

import RecipeDetailModal from "../components/RecipeDetailModal.vue"
import { browseFilterParam, decodeBrowseFilter, encodeBrowseFilter } from "../helpers/browse-filter"
import {
  MEAL_TYPE_KEY,
  MEAL_TYPES,
  type RecipeListItem,
  type RecipeListParams,
  type RecipeSortField,
} from "../models"
import { getRecipes, getRecipeTags, recipeQueryKeys } from "../services/api"

type SortKey = "rating_desc" | "name_asc" | "cookTimeMinutes_asc" | "caloriesPerServing_asc"

const SORT_OPTIONS: Record<SortKey, { sortBy: RecipeSortField; order: "asc" | "desc" }> = {
  rating_desc: { sortBy: "rating", order: "desc" },
  name_asc: { sortBy: "name", order: "asc" },
  cookTimeMinutes_asc: { sortBy: "cookTimeMinutes", order: "asc" },
  caloriesPerServing_asc: { sortBy: "caloriesPerServing", order: "asc" },
}

const PAGE_SIZES = [12, 24, 48] as const

const detailModal = useOverlay().create(RecipeDetailModal)

const { data: tags } = useQuery({
  queryKey: recipeQueryKeys.tags(),
  queryFn: getRecipeTags,
  staleTime: Infinity,
})

// ---- Filters (kept in the URL) ---------------------------------------------
const {
  page,
  limit,
  q: search,
  browse: browseValue,
  sort: sortKey,
} = useRouteQueryState(
  {
    ...paginationParams(PAGE_SIZES),
    q: stringParam({ maxLength: 100 }),
    browse: browseFilterParam(() => tags.value),
    sort: literalParam(Object.keys(SORT_OPTIONS) as SortKey[], "rating_desc"),
  },
  { resetKey: "page" },
)

const searchInput = useDebouncedQueryModel(search)

const listParams = computed<RecipeListParams>(() => ({
  page: page.value,
  limit: limit.value,
  search: search.value,
  filter: decodeBrowseFilter(browseValue.value),
  ...SORT_OPTIONS[sortKey.value],
}))

const browseItems = computed<SelectMenuItem[][]>(() => [
  [{ label: translate("features.recipes.filters.browse_all"), value: "" }],
  [
    { type: "label", label: translate("features.recipes.filters.group_meal") },
    ...MEAL_TYPES.map((meal) => ({
      label: translate(`features.recipes.meal_types.${MEAL_TYPE_KEY[meal]}`),
      value: encodeBrowseFilter({ kind: "meal", value: meal }),
    })),
  ],
  [
    { type: "label", label: translate("features.recipes.filters.group_tag") },
    ...(tags.value ?? []).map((tag) => ({ label: tag, value: encodeBrowseFilter({ kind: "tag", value: tag }) })),
  ],
])

const sortItems = computed(() =>
  (Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => ({
    label: translate(`features.recipes.filters.sort.${key}`),
    value: key,
  })),
)

// ---- Query ---------------------------------------------------------------
const { data: recipePage, isFetching, isPending, error, refetch } = useQuery({
  queryKey: computed(() => recipeQueryKeys.list(listParams.value)),
  queryFn: () => getRecipes(listParams.value),
  placeholderData: keepPreviousData,
})

const totalMinutes = (recipe: RecipeListItem) => recipe.prepTimeMinutes + recipe.cookTimeMinutes

const hasActiveFilters = computed(() => Boolean(search.value || browseValue.value))
const clearFilters = () => {
  search.value = ""
  browseValue.value = ""
}
</script>

<template>
  <UDashboardPanel id="recipes">
    <template #header>
      <UDashboardNavbar :title="translate('features.recipes.page_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <SearchInput v-model="searchInput" :placeholder="translate('features.recipes.filters.search_placeholder')" />
        </template>

        <template #right>
          <UTooltip :text="translate('features.recipes.filters.browse_locked')" :disabled="!search">
            <USelectMenu
              v-model="browseValue"
              :items="browseItems"
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
        :title="translate('features.recipes.load_error_title')"
        :error="error"
        @retry="refetch()"
      />

      <div v-else-if="isPending" class="grid shrink-0 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <USkeleton v-for="index in limit" :key="index" class="aspect-[4/5] w-full rounded-lg" />
      </div>

      <UEmpty
        v-else-if="!recipePage?.recipes.length"
        icon="i-lucide-chef-hat"
        :title="translate('features.recipes.empty_title')"
        :description="translate('features.recipes.empty_description')"
        :actions="hasActiveFilters ? [{ label: translate('utils.common.clear_filters'), icon: 'i-lucide-x', color: 'neutral', variant: 'subtle', onClick: clearFilters }] : []"
        variant="naked"
        class="flex-1"
      />

      <ul
        v-else
        class="grid shrink-0 gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        :class="{ 'opacity-60': isFetching }"
        :aria-busy="isFetching"
      >
        <li v-for="recipe in recipePage.recipes" :key="recipe.id">
          <button
            type="button"
            class="group flex w-full flex-col overflow-hidden rounded-lg text-left ring ring-default transition hover:ring-accented focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="detailModal.open({ recipeId: recipe.id })"
          >
            <div class="relative">
              <img :src="recipe.image" alt="" class="aspect-[4/3] w-full object-cover" loading="lazy" />
              <span
                class="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-default/90 px-2 py-0.5 text-xs font-medium text-highlighted tabular-nums backdrop-blur"
              >
                <UIcon name="i-lucide-clock" class="size-3.5" />
                {{ translate("features.recipes.card.minutes", { count: totalMinutes(recipe) }) }}
              </span>
            </div>

            <div class="flex flex-1 flex-col gap-2 p-4">
              <p class="font-semibold leading-snug text-highlighted group-hover:underline">{{ recipe.name }}</p>
              <p class="text-sm text-muted">{{ recipe.cuisine }}</p>

              <div class="mt-auto flex items-center justify-between gap-2 pt-2 text-sm">
                <span class="inline-flex items-center gap-1 tabular-nums">
                  <UIcon name="i-lucide-star" class="size-3.5 text-warning" />
                  <span class="font-medium text-highlighted">{{ recipe.rating.toFixed(1) }}</span>
                  <span class="text-muted">
                    ({{ translate("features.recipes.card.reviews", { count: recipe.reviewCount }) }})
                  </span>
                </span>
                <UBadge
                  :label="recipe.difficulty"
                  :color="recipe.difficulty === 'Easy' ? 'success' : recipe.difficulty === 'Medium' ? 'warning' : 'error'"
                  variant="subtle"
                  size="sm"
                />
              </div>
            </div>
          </button>
        </li>
      </ul>

      <DataTablePagination
        v-if="!error"
        v-model:page="page"
        v-model:limit="limit"
        :total="recipePage?.total ?? 0"
        :page-sizes="[...PAGE_SIZES]"
      />
    </template>
  </UDashboardPanel>
</template>
